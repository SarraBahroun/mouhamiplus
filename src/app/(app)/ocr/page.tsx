'use client'

import { useCallback, useRef, useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { SelectInput } from '@/components/ui/SelectInput'
import { useAppData } from '@/providers/AppDataProvider'

interface ScanResult {
  id: number
  name: string
  date: string
  caseTitle?: string
  excerpt: string
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const ACCEPTED_EXT = '.pdf,.jpg,.jpeg,.png'
const MAX_SIZE = 20 * 1024 * 1024

async function pdfFirstPageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error("Impossible de préparer la page PDF pour la numérisation.")
  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas
}

export default function OcrPage() {
  const { cases: initialCases } = useAppData()
  const [caseId, setCaseId] = useState('')
  const [scans, setScans] = useState<ScanResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError('')
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Format non supporté. Utilisez un PDF, JPG ou PNG.')
        return
      }
      if (file.size > MAX_SIZE) {
        setError('Fichier trop volumineux (20 Mo maximum).')
        return
      }

      setProcessing(true)
      setProgress(0)
      try {
        const { recognize } = await import('tesseract.js')
        const source = file.type === 'application/pdf' ? await pdfFirstPageToCanvas(file) : file

        const { data } = await recognize(source, 'fra+ara', {
          logger: (m) => {
            if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
          },
        })

        const text = data.text.trim()
        const excerpt = text ? (text.length > 240 ? `${text.slice(0, 240)}…` : text) : '(Aucun texte détecté sur ce document.)'
        const caseTitle = initialCases.find((c) => String(c.id) === caseId)?.title

        setScans((prev) => [
          { id: Date.now(), name: file.name, date: new Date().toLocaleString('fr-FR'), caseTitle, excerpt },
          ...prev,
        ])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de la numérisation du document.')
      } finally {
        setProcessing(false)
        setProgress(0)
      }
    },
    [caseId, initialCases]
  )

  const openPicker = () => inputRef.current?.click()

  const onFilesSelected = (files: FileList | null) => {
    const file = files?.[0]
    if (file) processFile(file)
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>Scanner OCR</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', margin: 0 }}>
            Numérisez et extrayez le texte de vos documents papier
          </p>
        </div>

        <div style={{ maxWidth: 360 }}>
          <SelectInput
            label="Dossier associé (optionnel)"
            value={caseId}
            onChange={setCaseId}
            options={[{ value: '', label: 'Aucun dossier' }, ...initialCases.map((c) => ({ value: String(c.id), label: c.title }))]}
          />
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
                Numérisation en cours… {progress > 0 ? `${progress}%` : ''}
              </p>
              <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', height: 6, borderRadius: 3, background: 'var(--color-secondary)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.2s' }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', margin: '0 0 4px' }}>
                Glissez-déposez un fichier ou une photo ici
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', margin: '0 0 16px' }}>
                PDF, JPG, PNG — jusqu&apos;à 20 Mo
              </p>
              <span onClick={(e) => e.stopPropagation()}>
                <Btn onClick={openPicker}>Choisir un fichier</Btn>
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
            Numérisations récentes
          </h2>
          {scans.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>
              Aucune numérisation pour l&apos;instant. Déposez un document ci-dessus pour commencer.
            </p>
          ) : (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', background: 'var(--color-card)' }}>
              {scans.map((s, i) => (
                <div key={s.id} style={{ padding: '13px 16px', borderBottom: i < scans.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)' }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-foreground)' }}>{s.date}</span>
                  </div>
                  {s.caseTitle && <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 6 }}>{s.caseTitle}</div>}
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-foreground)',
                      background: 'var(--color-secondary)',
                      borderRadius: 4,
                      padding: '8px 10px',
                      fontStyle: 'italic',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    &ldquo;{s.excerpt}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
