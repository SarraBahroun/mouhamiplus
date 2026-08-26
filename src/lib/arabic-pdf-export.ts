import type { jsPDF } from 'jspdf'

// jsPDF's built-in fonts have no Arabic glyphs and no bidi/shaping support, so Arabic
// text drawn directly with doc.text() comes out as disconnected, wrongly-ordered letters.
// Instead we rasterize each line onto a <canvas> using the browser's own text engine —
// which already shapes Arabic correctly and reorders mixed RTL/LTR text per the Unicode
// Bidi Algorithm — then embed that as an image per PDF page. Text is not selectable in
// the export, but it renders correctly for French, Arabic, and mixed lines.

let arabicFontLoad: Promise<void> | null = null

function loadArabicFont(): Promise<void> {
  if (!arabicFontLoad) {
    arabicFontLoad = (async () => {
      const face = new FontFace('Amiri', 'url(/fonts/Amiri-Regular.ttf)')
      await face.load()
      document.fonts.add(face)
    })()
  }
  return arabicFontLoad
}

function isArabicChar(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0
  return (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  )
}

// Unicode Bidi Algorithm rule P2/P3: a line/paragraph's base direction is set by its
// first strongly-directional character.
function lineDirection(line: string): 'rtl' | 'ltr' {
  for (const ch of line) {
    if (isArabicChar(ch)) return 'rtl'
    if (/[A-Za-z]/.test(ch)) return 'ltr'
  }
  return 'ltr'
}

const FONT_STACK = 'Amiri, Tahoma, Arial, sans-serif'

interface WrappedLine {
  text: string
  dir: 'rtl' | 'ltr'
}

function wrapParagraphs(text: string, ctx: CanvasRenderingContext2D, maxWidthPx: number): WrappedLine[] {
  const lines: WrappedLine[] = []
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      lines.push({ text: '', dir: 'ltr' })
      continue
    }
    const dir = lineDirection(para)
    const words = para.split(/(\s+)/)
    let current = ''
    for (const word of words) {
      const candidate = current + word
      if (current.trim() && ctx.measureText(candidate).width > maxWidthPx) {
        lines.push({ text: current.trim(), dir })
        current = word
      } else {
        current = candidate
      }
    }
    if (current.trim()) lines.push({ text: current.trim(), dir })
  }
  return lines
}

export async function exportTextToPdfPages(doc: jsPDF, text: string): Promise<void> {
  await loadArabicFont()

  const marginMm = 15
  const pageWidthMm = 210
  const pageHeightMm = 297
  const usableWidthMm = pageWidthMm - marginMm * 2
  const usableHeightMm = pageHeightMm - marginMm * 2

  const dpi = 150
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi)
  const usableWidthPx = mmToPx(usableWidthMm)
  const usableHeightPx = mmToPx(usableHeightMm)

  const fontSizePx = 26
  const lineHeightPx = Math.round(fontSizePx * 1.55)

  const measureCanvas = document.createElement('canvas')
  const mctx = measureCanvas.getContext('2d')
  if (!mctx) throw new Error("Impossible de préparer l'export PDF.")
  mctx.font = `${fontSizePx}px ${FONT_STACK}`
  const lines = wrapParagraphs(text, mctx, usableWidthPx)

  const makePageCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = usableWidthPx
    canvas.height = usableHeightPx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error("Impossible de préparer l'export PDF.")
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, usableWidthPx, usableHeightPx)
    ctx.fillStyle = '#000000'
    ctx.font = `${fontSizePx}px ${FONT_STACK}`
    ctx.textBaseline = 'top'
    return { canvas, ctx }
  }

  let { canvas: pageCanvas, ctx: pageCtx } = makePageCanvas()
  let y = 0
  let firstPage = true

  const flushPage = () => {
    const imgData = pageCanvas.toDataURL('image/png')
    if (!firstPage) doc.addPage()
    doc.addImage(imgData, 'PNG', marginMm, marginMm, usableWidthMm, usableHeightMm)
    firstPage = false
  }

  for (const line of lines) {
    if (y + lineHeightPx > usableHeightPx) {
      flushPage()
      ;({ canvas: pageCanvas, ctx: pageCtx } = makePageCanvas())
      y = 0
    }
    pageCtx.direction = line.dir
    pageCtx.textAlign = line.dir === 'rtl' ? 'right' : 'left'
    const x = line.dir === 'rtl' ? usableWidthPx : 0
    pageCtx.fillText(line.text, x, y, usableWidthPx)
    y += lineHeightPx
  }
  flushPage()
}
