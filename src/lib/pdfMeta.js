import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let workerConfigured = false

export function ensurePdfWorker() {
  if (workerConfigured) return
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
  workerConfigured = true
}

/**
 * Lightweight metadata probe used on import.
 * Full progressive page rendering lands in Phase 2+.
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
