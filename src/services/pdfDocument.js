import { ensurePdfWorker, pdfjs } from '../lib/pdfWorker'

/**
 * Open a PDF.js document from a Blob. Caller must destroy when done.
 */
export async function openPdfFromBlob(blob) {
  ensurePdfWorker()
  const data = new Uint8Array(await blob.arrayBuffer())
  const loadingTask = pdfjs.getDocument({
    data,
    disableAutoFetch: false,
    disableStream: false,
  })
  return loadingTask.promise
}

export async function getPageAspect(pdf, pageNumber = 1) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 1 })
  return {
    width: viewport.width,
    height: viewport.height,
    aspect: viewport.width / viewport.height,
  }
}

/**
 * Render one PDF page to a JPEG data URL for flip-book pages.
 */
export async function renderPageToDataUrl(pdf, pageNumber, { cssWidth, pixelRatio = 1 } = {}) {
  const page = await pdf.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const targetWidth = cssWidth || base.width
  const scale = (targetWidth / base.width) * pixelRatio
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(viewport.width))
  canvas.height = Math.max(1, Math.floor(viewport.height))

  const context = canvas.getContext('2d', { alpha: false })
  context.fillStyle = '#f3ebe0'
  context.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({
    canvasContext: context,
    viewport,
    intent: 'display',
  }).promise

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  if (typeof page.cleanup === 'function') page.cleanup()

  return {
    dataUrl,
    width: canvas.width / pixelRatio,
    height: canvas.height / pixelRatio,
  }
}
