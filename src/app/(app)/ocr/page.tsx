'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Worker as TesseractWorker } from 'tesseract.js'
import { Btn } from '@/components/ui/Btn'
import { SelectInput } from '@/components/ui/SelectInput'
import { NewCaseModal } from '@/components/cases/NewCaseModal'
import { exportTextToPdfPages } from '@/lib/arabic-pdf-export'
import { analyzeScannedDocument, transcribeDocument, type DocumentAnalysis } from './actions'
import { useAppData } from '@/providers/AppDataProvider'
import { useLang } from '@/providers/LangProvider'
import { useSession } from '@/providers/SessionProvider'

interface ScanResult {
  id: number
  name: string
  date: string
  file: File
  pageCount: number
  text: string
  caseId: string
  status: 'draft' | 'saving' | 'saved' | 'error'
  saveError?: string
  analysis: DocumentAnalysis | null
  analyzing: boolean
  analysisError?: string
}

// `image/*` (plutôt qu'une liste jpg/png) : indispensable sur mobile — l'iPhone
// convertit alors automatiquement ses photos HEIC en JPEG à la sélection, et la
// galerie/caméra apparaissent dans le sélecteur.
const ACCEPTED_EXT = 'image/*,application/pdf'
const MAX_SIZE = 20 * 1024 * 1024

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

// `file.type` est parfois vide sur mobile (capture caméra Android notamment) — on
// retombe alors sur l'extension plutôt que de rejeter la photo.
function isImageFile(file: File) {
  return file.type.startsWith('image/') || (!file.type && /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name))
}

// Valeur sentinelle du sélecteur de dossier : ouvre la création rapide au lieu de
// sélectionner un dossier existant. Ne doit jamais entrer en collision avec un id réel.
const NEW_CASE_VALUE = '__new_case__'

async function loadPdf(file: File) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const arrayBuffer = await file.arrayBuffer()
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise
}

type PdfDocument = Awaited<ReturnType<typeof loadPdf>>

// Rend UNE page à la fois (au lieu de toutes d'avance) : sur téléphone, garder en
// mémoire tous les canvas d'un PDF scanné multi-pages faisait planter l'onglet.
// L'échelle est plafonnée : un PDF scanné rendu en 2x dépassait la surface de canvas
// maximale d'iOS Safari (~16,7 Mpx), qui rend alors une page blanche sans erreur.
async function renderPdfPage(pdf: PdfDocument, pageNum: number, errorMessage: string): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum)
  const base = page.getViewport({ scale: 1 })
  const scale = Math.min(2, MAX_IMAGE_DIMENSION / Math.max(base.width, base.height))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error(errorMessage)
  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas
}

// Libère la mémoire du canvas dès que sa page est reconnue — indispensable sur mobile.
function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}

// Au-delà de ~2500px de long côté, une photo de téléphone n'apporte plus de précision
// supplémentaire à Tesseract mais multiplie le temps de reconnaissance — on downscale.
const MAX_IMAGE_DIMENSION = 2500

// Décode une image en respectant l'orientation EXIF : les photos prises au téléphone
// sont souvent stockées pivotées avec un simple tag d'orientation — sans ça, Tesseract
// reçoit un texte couché à 90° et ne détecte rien. Fallback <img> pour les navigateurs
// où createImageBitmap échoue sur ce fichier (vieux Safari, formats exotiques).
async function decodeImage(file: File, errorMessage: string): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(errorMessage)) }
      img.src = url
    })
  }
}

async function imageFileToCanvas(file: File, errorMessage: string, binarize: boolean): Promise<HTMLCanvasElement> {
  const bitmap = await decodeImage(file, errorMessage)
  const srcWidth = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
  const srcHeight = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(srcWidth, srcHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(srcWidth * scale)
  canvas.height = Math.round(srcHeight * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error(errorMessage)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  if ('close' in bitmap) bitmap.close()

  if (binarize) binarizeForOcr(context, canvas.width, canvas.height)
  return canvas
}

// Binarisation adaptative (Bradley/Roth, via image intégrale) : chaque pixel est
// comparé à la moyenne de son voisinage local, pas à un seuil global. C'est ce que
// font les applis de scan de documents — un simple étirement de contraste global ne
// suffit pas pour une photo de téléphone (ombre d'un côté, reflet de l'autre) et
// laissait Tesseract halluciner des caractères sans queue ni tête. Propriété utile :
// les grandes zones uniformes (fond de table, ombre large) ressortent blanches, seuls
// les traits localement plus sombres que leur voisinage (l'encre) ressortent noirs.
function binarizeForOcr(context: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = context.getImageData(0, 0, width, height)
  const { data } = imageData

  const gray = new Uint8ClampedArray(width * height)
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }

  // Image intégrale avec une ligne/colonne de zéros en bordure pour simplifier les bords.
  const iw = width + 1
  const integral = new Uint32Array(iw * (height + 1))
  for (let y = 0; y < height; y += 1) {
    let rowSum = 0
    for (let x = 0; x < width; x += 1) {
      rowSum += gray[y * width + x]
      integral[(y + 1) * iw + (x + 1)] = integral[y * iw + (x + 1)] + rowSum
    }
  }

  // Fenêtre = 1/8 du grand côté (paramètre canonique de Bradley). Une fenêtre trop
  // petite (essayée à 1/60) tient entière DANS un trait épais : la moyenne locale y vaut
  // le trait lui-même, l'intérieur des lettres ressortait blanc — lettres creuses,
  // Tesseract ne détectait plus rien du tout.
  const windowSize = Math.max(31, Math.floor(Math.max(width, height) / 8) | 1)
  const half = windowSize >> 1
  const threshold = 0.15
  for (let y = 0; y < height; y += 1) {
    const y1 = Math.max(0, y - half)
    const y2 = Math.min(height - 1, y + half)
    for (let x = 0; x < width; x += 1) {
      const x1 = Math.max(0, x - half)
      const x2 = Math.min(width - 1, x + half)
      const area = (x2 - x1 + 1) * (y2 - y1 + 1)
      const sum =
        integral[(y2 + 1) * iw + (x2 + 1)] -
        integral[y1 * iw + (x2 + 1)] -
        integral[(y2 + 1) * iw + x1] +
        integral[y1 * iw + x1]
      const value = gray[y * width + x] * area < sum * (1 - threshold) ? 0 : 255
      const p = (y * width + x) * 4
      data[p] = value
      data[p + 1] = value
      data[p + 2] = value
    }
  }
  context.putImageData(imageData, 0, 0)
}

export default function OcrPage() {
  const { cases: initialCases, clients, addCaseDocument, addCaseNote } = useAppData()
  const { currentUserName } = useSession()
  const { tr, rtl, lang } = useLang()
  const [caseId, setCaseId] = useState('')
  const [scans, setScans] = useState<ScanResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<{ langs: string; promise: Promise<TesseractWorker> } | null>(null)
  const loggerRef = useRef<(m: { status: string; progress: number }) => void>(() => {})

  // Langue du document scanné. Sur un document monolingue, restreindre Tesseract à la
  // bonne langue améliore nettement la précision : en fra+ara sur une photo imparfaite,
  // il pioche des caractères dans les deux alphabets et produit du charabia mêlé.
  const [docLang, setDocLang] = useState('ara')

  // Un worker Tesseract réutilisé pour tous les scans de la session : recréer un worker
  // à chaque page (ancien comportement) rechargeait le moteur WASM + les données de
  // langue (plusieurs Mo) à chaque fois — c'était le vrai goulot d'étranglement, pas la
  // reconnaissance elle-même. Recréé uniquement si la langue du document change.
  const getWorker = useCallback(async (langs: string) => {
    if (workerRef.current && workerRef.current.langs !== langs) {
      workerRef.current.promise.then((w) => w.terminate())
      workerRef.current = null
    }
    if (!workerRef.current) {
      const promise = (async () => {
        const tesseract = await import('tesseract.js')
        const worker = await tesseract.createWorker(langs, undefined, { logger: (m) => loggerRef.current(m) })
        // SINGLE_BLOCK : une photo de document = un bloc de texte — c'est le mode qui
        // marchait sur PC (défaut implicite de l'API) ; AUTO échouait parfois à trouver
        // le moindre bloc sur les photos et renvoyait un résultat vide. user_defined_dpi :
        // un canvas n'a pas de métadonnée DPI, sans ça Tesseract estime mal la taille du
        // texte.
        await worker.setParameters({ tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK, user_defined_dpi: '300' })
        return worker
      })()
      workerRef.current = { langs, promise }
    }
    return workerRef.current.promise
  }, [])

  useEffect(() => {
    return () => {
      workerRef.current?.promise.then((w) => w.terminate())
    }
  }, [])

  // null = fermé ; 'global' = sélecteur du haut ; sinon l'id du scan dont le sélecteur
  // a demandé la création.
  const [newCaseTarget, setNewCaseTarget] = useState<'global' | number | null>(null)

  const caseOptions = [
    { value: '', label: tr.ocr_no_case_option },
    { value: NEW_CASE_VALUE, label: tr.case_create_option },
    ...initialCases.map((c) => ({ value: String(c.id), label: c.title })),
  ]

  const onGlobalCaseChange = (v: string) => {
    if (v === NEW_CASE_VALUE) {
      setNewCaseTarget('global')
      return
    }
    setCaseId(v)
  }

  const onCaseCreated = (id: string) => {
    if (newCaseTarget === 'global') {
      setCaseId(id)
    } else if (newCaseTarget !== null) {
      updateScanCase(newCaseTarget, id)
    }
    setNewCaseTarget(null)
  }

  // Analyse IA du texte extrait : identifie le type de document, le résume, et
  // le rapproche d'un client / dossier du cabinet. Si un dossier est suggéré et
  // qu'aucun n'était encore choisi pour ce scan, il est pré-sélectionné (l'avocat
  // garde la main : rien n'est classé sans clic sur le bouton de classement).
  const runAnalysis = useCallback(
    async (scanId: number, text: string) => {
      if (!text.trim()) return
      setScans((prev) => prev.map((s) => (s.id === scanId ? { ...s, analyzing: true, analysisError: undefined } : s)))
      const result = await analyzeScannedDocument({
        text,
        lang,
        clients: clients.map((c) => ({ id: c.id, name: c.name })),
        cases: initialCases.map((c) => ({
          id: c.id,
          reference: c.reference,
          title: c.title,
          clientId: c.clientId,
          clientName: clients.find((cl) => cl.id === c.clientId)?.name ?? '',
          practiceArea: c.practiceArea,
        })),
      }).catch(() => ({ error: tr.ocr_analysis_error }))

      setScans((prev) =>
        prev.map((s) => {
          if (s.id !== scanId) return s
          if ('error' in result) return { ...s, analyzing: false, analysisError: tr.ocr_analysis_error }
          const applySuggestedCase = Boolean(result.analysis.caseId) && !s.caseId
          return {
            ...s,
            analyzing: false,
            analysis: result.analysis,
            caseId: applySuggestedCase ? (result.analysis.caseId as string) : s.caseId,
          }
        })
      )
    },
    [lang, clients, initialCases, tr]
  )

  const processFile = useCallback(
    async (file: File) => {
      setError('')
      if (!isPdfFile(file) && !isImageFile(file)) {
        setError(tr.ocr_error_unsupported_format)
        return
      }
      if (file.size > MAX_SIZE) {
        setError(tr.ocr_error_file_too_large)
        return
      }

      setProcessing(true)
      setProgress(0)
      setProgressLabel(tr.ocr_progress_preparing)
      try {
        const pdf = isPdfFile(file) ? await loadPdf(file) : null
        const totalPages = pdf ? pdf.numPages : 1

        const texts: string[] = []
        for (let i = 0; i < totalPages; i += 1) {
          const pageLabel = totalPages > 1 ? `${tr.ocr_progress_page_prefix} ${i + 1} ${tr.ocr_progress_page_of} ${totalPages} — ` : ''
          const canvas = pdf
            ? await renderPdfPage(pdf, i + 1, tr.ocr_error_pdf_page_prep)
            : await imageFileToCanvas(file, tr.ocr_error_image_prep, false)

          // Moteur principal : Gemini en vision (déjà utilisé par les fonctions IA de
          // l'app) — très supérieur à Tesseract sur l'arabe et sur les photos de
          // téléphone. Tesseract (local) reste le secours automatique si l'appel échoue
          // (clé absente, réseau, quota).
          setProgressLabel(`${pageLabel}${tr.ocr_progress_ai}`)
          setProgress(Math.round((i / totalPages) * 100))
          let pageText: string | null = null
          const aiResult = await transcribeDocument(canvas.toDataURL('image/jpeg', 0.85), docLang).catch(() => null)
          if (aiResult && 'text' in aiResult && aiResult.text.trim()) {
            pageText = aiResult.text.trim()
          }

          if (pageText === null) {
            const worker = await getWorker(docLang)
            loggerRef.current = (m) => {
              if (m.status === 'recognizing text') {
                setProgress(Math.round(((i + m.progress) / totalPages) * 100))
              } else {
                setProgressLabel(m.status)
              }
            }
            if (!pdf) {
              const ctx = canvas.getContext('2d')
              if (ctx) binarizeForOcr(ctx, canvas.width, canvas.height)
            }
            const { data } = await worker.recognize(canvas)
            pageText = data.text.trim()

            // Filet de sécurité pour les photos : si la version binarisée ne donne quasi
            // rien (prétraitement qui a détruit l'image plutôt qu'aidé), on retente sur
            // l'image brute et on garde le meilleur des deux résultats.
            if (!pdf && pageText.replace(/\s/g, '').length < 10) {
              const rawCanvas = await imageFileToCanvas(file, tr.ocr_error_image_prep, false)
              const retry = await worker.recognize(rawCanvas)
              releaseCanvas(rawCanvas)
              const retryText = retry.data.text.trim()
              if (retryText.replace(/\s/g, '').length > pageText.replace(/\s/g, '').length) {
                pageText = retryText
              }
            }
          }
          releaseCanvas(canvas)
          texts.push(pageText)
        }
        await pdf?.cleanup()

        const text = texts.filter(Boolean).join('\n\n').trim()

        const scanId = Date.now()
        setScans((prev) => [
          {
            id: scanId,
            name: file.name,
            date: new Date().toLocaleString('fr-FR'),
            file,
            pageCount: totalPages,
            text,
            caseId,
            status: 'draft',
            analysis: null,
            analyzing: false,
          },
          ...prev,
        ])
        // Analyse lancée en arrière-plan dès la fin du scan — le texte est déjà
        // affiché et éditable pendant ce temps.
        if (text) void runAnalysis(scanId, text)
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.ocr_error_scan_failed)
      } finally {
        setProcessing(false)
        setProgress(0)
        setProgressLabel('')
      }
    },
    [caseId, tr, getWorker, docLang, runAnalysis]
  )

  const updateScanText = (id: number, text: string) => {
    setScans((prev) => prev.map((s) => (s.id === id ? { ...s, text, status: s.status === 'saved' ? 'draft' : s.status } : s)))
  }

  const updateScanCase = (id: number, newCaseId: string) => {
    setScans((prev) => prev.map((s) => (s.id === id ? { ...s, caseId: newCaseId, status: s.status === 'saved' ? 'draft' : s.status } : s)))
  }

  const classifyScan = async (scan: ScanResult) => {
    if (!scan.caseId) return
    setScans((prev) => prev.map((s) => (s.id === scan.id ? { ...s, status: 'saving', saveError: undefined } : s)))
    const uploaded = await addCaseDocument(scan.caseId, scan.file)
    if (!uploaded) {
      setScans((prev) =>
        prev.map((s) => (s.id === scan.id ? { ...s, status: 'error', saveError: tr.ocr_error_add_document_failed } : s))
      )
      return
    }
    if (scan.text) {
      await addCaseNote(scan.caseId, currentUserName || tr.nav_ocr, `${tr.ocr_note_label} (${scan.name}) :\n${scan.text}`)
    }
    setScans((prev) => prev.map((s) => (s.id === scan.id ? { ...s, status: 'saved' } : s)))
  }

  const caseById = (id: string | null) => initialCases.find((c) => c.id === id)
  const clientById = (id: string | null) => clients.find((c) => c.id === id)

  const exportScanToPdf = async (scan: ScanResult) => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    await exportTextToPdfPages(doc, scan.text || tr.ocr_no_text_detected)
    doc.save(`${scan.name.replace(/\.[^.]+$/, '')}-ocr.pdf`)
  }

  const openPicker = () => inputRef.current?.click()

  const onFilesSelected = (files: FileList | null) => {
    const file = files?.[0]
    if (file) processFile(file)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>{tr.nav_ocr}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            {tr.ocr_subtitle}
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div style={{ width: '100%', maxWidth: 220 }}>
            <SelectInput
              label={tr.ocr_doc_lang_label}
              value={docLang}
              onChange={setDocLang}
              options={[
                { value: 'ara', label: tr.ocr_doc_lang_ar },
                { value: 'fra', label: tr.ocr_doc_lang_fr },
                { value: 'fra+ara', label: tr.ocr_doc_lang_both },
              ]}
              rtl={rtl}
            />
          </div>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <SelectInput label={tr.ocr_case_label} value={caseId} onChange={onGlobalCaseChange} options={caseOptions} rtl={rtl} />
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          hidden
          onChange={(e) => {
            onFilesSelected(e.target.files)
            e.target.value = ''
          }}
        />
        {/* capture="environment" ouvre directement l'appareil photo arrière sur mobile. */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            onFilesSelected(e.target.files)
            e.target.value = ''
          }}
        />

        <div
          onClick={() => !processing && openPicker()}
          onDragOver={(e) => {
            e.preventDefault()
            if (!processing) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (!processing) onFilesSelected(e.dataTransfer.files)
          }}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 8,
            padding: '40px 20px',
            textAlign: 'center',
            background: dragging ? 'var(--color-secondary)' : 'var(--color-card)',
            cursor: processing ? 'default' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          {processing ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', margin: '0 0 10px' }}>
                {tr.ocr_scanning_in_progress} {progress > 0 ? `${progress}%` : ''}
              </p>
              {progressLabel && (
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: '0 0 10px' }}>{progressLabel}</p>
              )}
              <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', height: 6, borderRadius: 3, background: 'var(--color-secondary)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.2s' }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', margin: '0 0 4px' }}>
                {tr.ocr_dropzone_title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: '0 0 16px' }}>
                {tr.ocr_dropzone_hint}
              </p>
              <span onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 flex-wrap">
                <Btn onClick={openPicker}>{tr.ocr_choose_file}</Btn>
                <Btn variant="secondary" onClick={() => cameraRef.current?.click()}>{tr.ocr_take_photo}</Btn>
              </span>
            </>
          )}
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#B3261E', background: 'rgba(179,38,30,0.08)', border: '1px solid rgba(179,38,30,0.2)', borderRadius: 6, padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>
            {tr.ocr_recent_title}
          </h2>
          {scans.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
              {tr.ocr_recent_empty}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {scans.map((s) => (
                <div key={s.id} style={{ border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-card)', padding: '14px 16px' }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>
                      {s.name}
                      {s.pageCount > 1 && (
                        <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontWeight: 400 }}> · {s.pageCount} {tr.ocr_pages_suffix}</span>
                      )}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{s.date}</span>
                  </div>

                  <textarea
                    value={s.text}
                    onChange={(e) => updateScanText(s.id, e.target.value)}
                    placeholder={tr.ocr_no_text_detected}
                    style={{
                      width: '100%',
                      minHeight: 380,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--color-foreground)',
                      background: 'var(--color-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: '10px 12px',
                      fontFamily: 'var(--font-body)',
                      resize: 'vertical',
                    }}
                  />

                  {(s.analyzing || s.analysis || s.analysisError) && (
                    <div style={{ marginTop: 10, border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-secondary)', padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-foreground)', marginBottom: 6 }}>
                        ✨ {tr.ocr_analysis_title}
                      </div>
                      {s.analyzing ? (
                        <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>{tr.ocr_analyzing}</div>
                      ) : s.analysisError ? (
                        <div style={{ fontSize: 12, color: '#B3261E' }}>{s.analysisError}</div>
                      ) : s.analysis ? (
                        <div className="flex flex-col gap-1" style={{ fontSize: 12.5, color: 'var(--color-foreground)' }}>
                          <div>
                            <strong>{tr.ocr_analysis_doc_type}</strong> : {s.analysis.docType}
                          </div>
                          <div>{s.analysis.summary}</div>
                          {s.analysis.clientId || s.analysis.caseId ? (
                            <>
                              {s.analysis.clientId && (
                                <div>
                                  <strong>{tr.ocr_analysis_client}</strong> : {clientById(s.analysis.clientId)?.name}
                                </div>
                              )}
                              {s.analysis.caseId && (
                                <div>
                                  <strong>{tr.ocr_analysis_case}</strong> : {caseById(s.analysis.caseId)?.title}
                                  {caseById(s.analysis.caseId)?.reference ? ` (${caseById(s.analysis.caseId)?.reference})` : ''}
                                </div>
                              )}
                              {s.analysis.reason && (
                                <div style={{ color: 'var(--color-muted-foreground)' }}>{s.analysis.reason}</div>
                              )}
                              {s.analysis.caseId !== null && s.analysis.caseId === s.caseId && s.status !== 'saved' && (
                                <div style={{ color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
                                  {tr.ocr_analysis_case_applied}
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ color: 'var(--color-muted-foreground)' }}>{tr.ocr_analysis_no_match}</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-3 mt-3 flex-wrap">
                    <div style={{ maxWidth: 280, width: '100%' }}>
                      <SelectInput
                        label={tr.shell_case_file}
                        value={s.caseId}
                        onChange={(v) => (v === NEW_CASE_VALUE ? setNewCaseTarget(s.id) : updateScanCase(s.id, v))}
                        options={caseOptions}
                        rtl={rtl}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Btn variant="secondary" onClick={() => runAnalysis(s.id, s.text)} disabled={s.analyzing || !s.text.trim()}>
                        {s.analyzing ? tr.ocr_analyzing : tr.ocr_analyze_button}
                      </Btn>
                      <Btn variant="secondary" onClick={() => exportScanToPdf(s)}>
                        {tr.ocr_export_pdf}
                      </Btn>
                      <Btn onClick={() => classifyScan(s)} disabled={!s.caseId || s.status === 'saving'}>
                        {s.status === 'saved' ? tr.ocr_status_saved : s.status === 'saving' ? tr.ocr_status_saving : tr.ocr_classify_button}
                      </Btn>
                    </div>
                  </div>

                  {s.status === 'error' && (
                    <div style={{ fontSize: 12, color: '#B3261E', marginTop: 8 }}>{s.saveError}</div>
                  )}
                  {!s.caseId && s.status !== 'saved' && (
                    <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginTop: 8 }}>
                      {tr.ocr_choose_case_hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {newCaseTarget !== null && (
        <NewCaseModal onCreated={onCaseCreated} onClose={() => setNewCaseTarget(null)} />
      )}
    </div>
  )
}
