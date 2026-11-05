import { ensurePdfWorker, pdfjs } from '../lib/pdfWorker'

function humanizePdfError(error) {
  const name = error?.name || ''
  const message = error?.message || ''

  if (name === 'PasswordException' || /password/i.test(message)) {
    return 'This PDF is password-protected. PageFlip can’t open encrypted files yet.'
  }
  if (name === 'InvalidPDFException' || /invalid pdf/i.test(message)) {
    return 'This file doesn’t look like a valid PDF.'
  }
  if (name === 'MissingPDFException') {
    return 'The PDF data is missing or unreadable on this device.'
  }
  if (name === 'UnexpectedResponseException') {
    return 'Could not read the PDF data.'
  }
  return message || 'Could not read this PDF.'
}

/**
 * Open a PDF.js document from a Blob. Caller must destroy when done.
 */
export async function openPdfFromBlob(blob) {
  ensurePdfWorker()

  if (!blob || blob.size === 0) {
    throw new Error('This PDF is empty.')
  }

  try {
    const data = new Uint8Array(await blob.arrayBuffer())
    if (!data.byteLength) {
      throw new Error('This PDF is empty.')
    }

    const loadingTask = pdfjs.getDocument({
      data,
      disableAutoFetch: false,
      disableStream: false,
    })
    return await loadingTask.promise
  } catch (error) {
    const enriched = new Error(humanizePdfError(error))
    enriched.cause = error
    throw enriched
  }
}

export async function getPageAspect(pdf, pageNumber = 1) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 1 })
  return {
    width: viewport.width,
    height: viewport.height,
    aspect: viewport.width / viewport.height,
    landscape: viewport.width > viewport.height,
  }
}

/**
 * Sample a few pages so mixed portrait/landscape docs get a stable stage size.
 */
export async function getDominantPageAspect(pdf) {
  const count = pdf.numPages
  if (!count) {
    return { width: 595, height: 842, aspect: 210 / 297, landscape: false }
  }

  const samples = new Set([
    1,
    Math.max(1, Math.round(count / 2)),
    count,
  ])

  let best = null
  for (const pageNumber of samples) {
    try {
      const size = await getPageAspect(pdf, pageNumber)
      if (!best || size.width * size.height > best.width * best.height) {
        best = size
      }
    } catch {
      // skip unreadable sample
    }
  }

  return best || { width: 595, height: 842, aspect: 210 / 297, landscape: false }
}

/**
 * Render one PDF page to a JPEG data URL for flip-book pages.
 */
export async function renderPageToDataUrl(
  pdf,
  pageNumber,
  { cssWidth, pixelRatio = 1, quality = 0.88 } = {},
) {
  const page = await pdf.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const targetWidth = cssWidth || base.width
  const scale = (targetWidth / base.width) * pixelRatio
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(viewport.width))
  canvas.height = Math.max(1, Math.floor(viewport.height))

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) {
    throw new Error('Canvas unavailable in this browser.')
  }

  context.fillStyle = '#f3ebe0'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const renderTask = page.render({
    canvasContext: context,
    viewport,
    intent: 'display',
  })

  try {
    await renderTask.promise
  } catch (error) {
    if (typeof renderTask.cancel === 'function') renderTask.cancel()
    throw error
  }

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  if (typeof page.cleanup === 'function') page.cleanup()

  return {
    dataUrl,
    width: canvas.width / pixelRatio,
    height: canvas.height / pixelRatio,
    pageAspect: base.width / base.height,
  }
}
