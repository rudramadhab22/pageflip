import { useEffect, useState } from 'react'
import { getDominantPageAspect, openPdfFromBlob } from '../services/pdfDocument'

export function usePdfDocument(blob) {
  const [pdf, setPdf] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [aspect, setAspect] = useState(210 / 297)
  const [status, setStatus] = useState(blob ? 'loading' : 'idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!blob) {
      setPdf(null)
      setPageCount(0)
      setStatus('idle')
      setError(null)
      return undefined
    }

    let cancelled = false
    let documentRef = null

    async function load() {
      setStatus('loading')
      setError(null)
      setPdf(null)
      setPageCount(0)

      try {
        const doc = await openPdfFromBlob(blob)
        if (cancelled) {
          await doc.destroy().catch(() => {})
          return
        }

        documentRef = doc

        if (!doc.numPages) {
          await doc.destroy().catch(() => {})
          documentRef = null
          setStatus('error')
          setError('This PDF has no pages to display.')
          return
        }

        const size = await getDominantPageAspect(doc)
        if (cancelled) {
          await doc.destroy().catch(() => {})
          documentRef = null
          return
        }

        setAspect(size.aspect || 210 / 297)
        setPageCount(doc.numPages)
        setPdf(doc)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err?.message || 'Could not read this PDF.')
      }
    }

    load()

    return () => {
      cancelled = true
      const doc = documentRef
      documentRef = null
      if (doc) {
        // Defer destroy so in-flight getPage calls can settle without racing setState.
        queueMicrotask(() => {
          doc.destroy().catch(() => {})
        })
      }
    }
  }, [blob])

  return { pdf, pageCount, aspect, status, error }
}
