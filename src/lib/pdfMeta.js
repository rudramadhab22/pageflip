import { ensurePdfWorker, pdfjs } from './pdfWorker'

/**
 * Lightweight metadata probe used on import.
 */
export async function probePdfMetadata(data) {
  ensurePdfWorker()
  const loadingTask = pdfjs.getDocument({ data, disableAutoFetch: true, disableStream: false })
  const pdf = await loadingTask.promise
  const pageCount = pdf.numPages
  let title = ''

  try {
    const meta = await pdf.getMetadata()
    title = meta?.info?.Title?.trim?.() || ''
  } catch {
    title = ''
  }

  await pdf.destroy()
  return { pageCount, title }
}
