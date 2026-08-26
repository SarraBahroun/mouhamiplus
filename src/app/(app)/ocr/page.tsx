'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Worker as TesseractWorker } from 'tesseract.js'
import { Btn } from '@/components/ui/Btn'
import { SelectInput } from '@/components/ui/SelectInput'
import { NewCaseModal } from '@/components/cases/NewCaseModal'
import { exportTextToPdfPages } from '@/lib/arabic-pdf-export'
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

async function imageFileToCanvas(file: File, errorMessage: string): Promise<HTMLCanvasElement> {
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

  // Étire le contraste (niveaux de gris + normalisation par percentiles 2%/98%) : les
  // photos prises au téléphone ont souvent un éclairage inégal qui fait rater du texte
  // à Tesseract. Les percentiles (plutôt que le min/max brut) évitent qu'un reflet ou
  // une ombre isolée n'écrase tout l'étirement.
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData
  const pixelCount = data.length / 4
  const gray = new Uint8ClampedArray(pixelCount)
  const histogram = new Uint32Array(256)
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    gray[i / 4] = g
    histogram[Math.round(g)] += 1
  }
  const lowCut = Math.floor(pixelCount * 0.02)
  const highCut = Math.floor(pixelCount * 0.98)
  let seen = 0
  let low = 0
  let high = 255
  for (let v = 0; v < 256; v += 1) {
    seen += histogram[v]
    if (seen >= lowCut) { low = v; break }
  }
  seen = 0
  for (let v = 255; v >= 0; v -= 1) {
    seen += histogram[v]
    if (seen >= pixelCount - highCut) { high = v; break }
  }
  const range = high - low || 1
  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((gray[i / 4] - low) / range) * 255
    data[i] = stretched
    data[i + 1] = stretched
    data[i + 2] = stretched
  }
  context.putImageData(imageData, 0, 0)
  return canvas
}

export default function OcrPage() {
  const { cases: initialCases, addCaseDocument, addCaseNote } = useAppData()
  const { currentUserName } = useSession()
  const { tr, rtl } = useLang()
  const [caseId, setCaseId] = useState('')
  const [scans, setScans] = useState<ScanResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Promise<TesseractWorker> | null>(null)
  const loggerRef = useRef<(m: { status: string; progress: number }) => void>(() => {})

  // Un worker Tesseract réutilisé pour tous les scans de la session : recréer un worker
  // à chaque page (ancien comportement) rechargeait le moteur WASM + les données de
  // langue fra+ara (plusieurs Mo) à chaque fois — c'était le vrai goulot d'étranglement,
  // pas la reconnaissance elle-même.
  const getWorker = useCallback(async () => {
    if (!workerRef.current) {
      workerRef.current = (async () => {
        const { createWorker } = await import('tesseract.js')
        return createWorker('fra+ara', undefined, { logger: (m) => loggerRef.current(m) })
      })()
    }
    return workerRef.current
  }, [])

  useEffect(() => {
    return () => {
      workerRef.current?.then((w) => w.terminate())
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
        const worker = await getWorker()
        const pdf = isPdfFile(file) ? await loadPdf(file) : null
        const totalPages = pdf ? pdf.numPages : 1

        const texts: string[] = []
        for (let i = 0; i < totalPages; i += 1) {
          if (totalPages > 1) setProgressLabel(`${tr.ocr_progress_page_prefix} ${i + 1} ${tr.ocr_progress_page_of} ${totalPages}…`)
          loggerRef.current = (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(((i + m.progress) / totalPages) * 100))
            } else {
              setProgressLabel(m.status)
            }
          }
          const canvas = pdf
            ? await renderPdfPage(pdf, i + 1, tr.ocr_error_pdf_page_prep)
            : await imageFileToCanvas(file, tr.ocr_error_image_prep)
          const { data } = await worker.recognize(canvas)
          releaseCanvas(canvas)
          texts.push(data.text.trim())
        }
        await pdf?.cleanup()

        const text = texts.filter(Boolean).join('\n\n').trim()

        setScans((prev) => [
          {
            id: Date.now(),
            name: file.name,
            date: new Date().toLocaleString('fr-FR'),
            file,
            pageCount: totalPages,
            text,
            caseId,
            status: 'draft',
          },
          ...prev,
        ])
      } catch (e) {
        setError(e instanceof Error ? e.message : tr.ocr_error_scan_failed)
      } finally {
        setProcessing(false)
        setProgress(0)
        setProgressLabel('')
      }
    },
    [caseId, tr, getWorker]
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

        <div style={{ maxWidth: 360 }}>
          <SelectInput label={tr.ocr_case_label} value={caseId} onChange={onGlobalCaseChange} options={caseOptions} rtl={rtl} />
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
