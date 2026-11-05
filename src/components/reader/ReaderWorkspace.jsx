import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PdfReaderProvider } from '../../context/PdfReaderContext'
import { useElementSize } from '../../hooks/useElementSize'
import { usePdfDocument } from '../../hooks/usePdfDocument'
import { clearPageImageCache } from '../../services/pageImageCache'
import { setProgress } from '../../services/readingProgress'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Spinner } from '../ui/Spinner'
import { BookStage } from './BookStage'

function computePageSize(containerWidth, containerHeight, aspect) {
  const safeAspect = aspect > 0 ? aspect : 210 / 297
  const horizontalBudget = Math.max(280, containerWidth - 48)
  const verticalBudget = Math.max(360, containerHeight - 24)

  let pageWidth = Math.min(460, Math.floor(horizontalBudget / 2.08))
  let pageHeight = Math.floor(pageWidth / safeAspect)

  if (pageHeight > verticalBudget) {
    pageHeight = Math.floor(verticalBudget)
    pageWidth = Math.floor(pageHeight * safeAspect)
  }

  if (containerWidth < 720) {
    pageWidth = Math.min(pageWidth, Math.floor(containerWidth - 32))
    pageHeight = Math.floor(pageWidth / safeAspect)
    if (pageHeight > verticalBudget) {
      pageHeight = Math.floor(verticalBudget)
      pageWidth = Math.floor(pageHeight * safeAspect)
    }
  }

  return {
    pageWidth: Math.max(180, pageWidth),
    pageHeight: Math.max(240, pageHeight),
  }
}

export function ReaderWorkspace({ bookId, blob, title }) {
  const stageRef = useRef(null)
  const flipBookRef = useRef(null)
  const stageSize = useElementSize(stageRef)
  const { pdf, pageCount, aspect, status, error } = usePdfDocument(blob)

  const [flipIndex, setFlipIndex] = useState(0)
  const [orientation, setOrientation] = useState('landscape')

  const { pageWidth, pageHeight } = useMemo(
    () => computePageSize(stageSize.width || 960, stageSize.height || 700, aspect),
    [stageSize.width, stageSize.height, aspect],
  )

  useEffect(() => {
    clearPageImageCache(bookId)
    return () => clearPageImageCache(bookId)
  }, [bookId])

  useEffect(() => {
    if (!bookId || !pageCount) return
    const currentPage = Math.min(pageCount, Math.max(1, flipIndex || 1))
    setProgress(bookId, {
      currentPage,
      pageCount,
      percent: Math.round((currentPage / pageCount) * 100),
    })
  }, [bookId, flipIndex, pageCount])

  const pdfPageLabel = useMemo(() => {
    if (!pageCount) return '—'
    if (flipIndex <= 0) return 'Cover'
    if (flipIndex >= pageCount + 1) return 'Back cover'
    if (orientation === 'landscape') {
      const left = flipIndex
      const right = Math.min(pageCount, flipIndex + 1)
      if (left === right || flipIndex === pageCount) return `Page ${left}`
      // Odd indexes in landscape often show a spread starting at left page.
      return `Pages ${left}–${right}`
    }
    return `Page ${Math.min(pageCount, flipIndex)}`
  }, [flipIndex, pageCount, orientation])

  const percent = useMemo(() => {
    if (!pageCount) return 0
    const currentPdfPage = Math.min(pageCount, Math.max(0, flipIndex))
    return Math.round((currentPdfPage / pageCount) * 100)
  }, [flipIndex, pageCount])

  const onFlip = useCallback((event) => {
    setFlipIndex(typeof event?.data === 'number' ? event.data : 0)
  }, [])

  const onInit = useCallback((event) => {
    if (typeof event?.data?.page === 'number') setFlipIndex(event.data.page)
    if (event?.data?.mode) setOrientation(event.data.mode)
  }, [])

  const onChangeOrientation = useCallback((event) => {
    if (event?.data) setOrientation(event.data)
  }, [])

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-gilt-bright"
          >
            <ArrowLeft className="size-4" />
            Library
          </Link>
          <h1 className="mt-2 truncate font-display text-2xl text-ink-100 sm:text-3xl">
            {title || 'Untitled book'}
          </h1>
        </div>

        <div className="rounded-xl border border-white/8 bg-ink-850/80 px-4 py-2 text-right">
          <p className="text-sm text-ink-100">{pdfPageLabel}</p>
          <p className="text-[11px] tracking-wide text-ink-500 uppercase">
            {pageCount ? `${pageCount} pages · ${percent}% read` : 'Preparing'}
          </p>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative flex min-h-[60dvh] flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/6 bg-ink-950/40 px-3 py-6 sm:px-6"
      >
        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-3 text-ink-300">
            <Spinner className="size-8" label="Loading PDF" />
            <p className="text-sm">Binding your hardcover…</p>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="w-full max-w-md">
            <ErrorBanner message={error} />
          </div>
        ) : null}

        {status === 'ready' && pageCount > 0 && pdf ? (
          <PdfReaderProvider
            pdf={pdf}
            pageCount={pageCount}
            cssWidth={pageWidth}
            flipIndex={flipIndex}
            title={title}
            bookId={bookId}
          >
            <BookStage
              bookId={bookId}
              title={title}
              pageCount={pageCount}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              flipBookRef={flipBookRef}
              onFlip={onFlip}
              onInit={onInit}
              onChangeOrientation={onChangeOrientation}
            />
          </PdfReaderProvider>
        ) : null}
      </div>

      <p className="mt-4 text-center text-xs text-ink-500">
        Drag a page corner or swipe to turn · hardcover with live PDF pages
      </p>
    </div>
  )
}
