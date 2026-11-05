import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ReaderWorkspace } from '../components/reader/ReaderWorkspace'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Spinner } from '../components/ui/Spinner'
import { useLibrary } from '../context/LibraryContext'
import { stripPdfExtension } from '../lib/format'
import { getPdfRecord } from '../services/idb'
import { touchRecentBook } from '../services/recentBooks'

export function ReaderPage() {
  const { bookId } = useParams()
  const { recentBooks, refreshRecent } = useLibrary()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [record, setRecord] = useState(null)
  const [immersive, setImmersive] = useState(false)

  const meta = recentBooks.find((book) => book.id === bookId) || null
  const title = meta?.title || stripPdfExtension(record?.name || meta?.name || '')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setError(null)
      setRecord(null)

      try {
        const pdf = await getPdfRecord(bookId)
        if (cancelled) return

        if (!pdf?.blob) {
          setStatus('error')
          setError('This book is no longer available on this device.')
          return
        }

        touchRecentBook(bookId)
        refreshRecent()
        setRecord(pdf)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err?.message || 'Failed to open this book.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [bookId, refreshRecent])

  return (
    <AppShell dense hideChrome={immersive} fullBleed>
      {status === 'loading' ? (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-ink-300">
          <Spinner label="Opening book" className="size-8" />
          <p className="text-sm">Opening your book…</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mx-auto max-w-lg space-y-4 pt-16">
          <ErrorBanner message={error} />
          <Link to="/" className="inline-flex text-sm text-gilt hover:text-gilt-bright">
            Return home
          </Link>
        </div>
      ) : null}

      {status === 'ready' ? (
        <ReaderWorkspace
          bookId={bookId}
          blob={record.blob}
          title={title}
          immersive={immersive}
          onImmersiveChange={setImmersive}
        />
      ) : null}
    </AppShell>
  )
}
