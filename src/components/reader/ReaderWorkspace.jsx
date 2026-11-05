import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PdfReaderProvider } from '../../context/PdfReaderContext'
import { useBookmarks } from '../../hooks/useBookmarks'
import { useElementSize } from '../../hooks/useElementSize'
import { useFlipControls } from '../../hooks/useFlipControls'
import { useFullscreen } from '../../hooks/useFullscreen'
import { usePdfDocument } from '../../hooks/usePdfDocument'
import {
  describeFlipPosition,
  getCurrentPdfPage,
  readingPercent,
} from '../../lib/readerPages'
import { clearPageImageCache } from '../../services/pageImageCache'
import { getProgress, setProgress } from '../../services/readingProgress'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Spinner } from '../ui/Spinner'
import { BookStage } from './BookStage'
import { BookmarksPanel } from './BookmarksPanel'
import { ReaderToolbar } from './ReaderToolbar'
import { ReadingProgressBar } from './ReadingProgressBar'

const ZOOM_STEPS = [0.7, 0.85, 1, 1.15, 1.35]

function computePageSize(containerWidth, containerHeight, aspect, zoom) {
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

  pageWidth = Math.max(160, Math.round(pageWidth * zoom))
  pageHeight = Math.max(220, Math.round(pageHeight * zoom))

  return { pageWidth, pageHeight }
}

export function ReaderWorkspace({ bookId, blob, title }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const flipBookRef = useRef(null)
  const restoredRef = useRef(false)

  const stageSize = useElementSize(stageRef)
  const { pdf, pageCount, aspect, status, error } = usePdfDocument(blob)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(rootRef)
  const { bookmarks, toggleBookmark, remove, isBookmarked } = useBookmarks(bookId)
  const { flipNext, flipPrev, goToPdfPage } = useFlipControls(flipBookRef, pageCount)

  const [flipIndex, setFlipIndex] = useState(0)
  const [orientation, setOrientation] = useState('landscape')
  const [zoomIndex, setZoomIndex] = useState(2)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)

  const zoom = ZOOM_STEPS[zoomIndex]
  const zoomLabel = `${Math.round(zoom * 100)}%`

  const { pageWidth, pageHeight } = useMemo(
    () => computePageSize(stageSize.width || 960, stageSize.height || 700, aspect, zoom),
    [stageSize.width, stageSize.height, aspect, zoom],
  )

  const currentPdfPage = getCurrentPdfPage(flipIndex, pageCount)
  const percent = readingPercent(flipIndex, pageCount)
  const pdfPageLabel = describeFlipPosition(flipIndex, pageCount, orientation)
  const canPrev = flipIndex > 0
  const canNext = flipIndex < pageCount + 1
  const bookmarked = isBookmarked(currentPdfPage)

  useEffect(() => {
    clearPageImageCache(bookId)
    restoredRef.current = false
    return () => clearPageImageCache(bookId)
  }, [bookId])

  useEffect(() => {
    if (!bookId || !pageCount) return
    setProgress(bookId, {
      currentPage: currentPdfPage,
      pageCount,
      percent,
    })
  }, [bookId, currentPdfPage, pageCount, percent])

  const onFlip = useCallback((event) => {
    setFlipIndex(typeof event?.data === 'number' ? event.data : 0)
  }, [])

  const onInit = useCallback(
    (event) => {
      if (typeof event?.data?.page === 'number') setFlipIndex(event.data.page)
      if (event?.data?.mode) setOrientation(event.data.mode)

      if (!restoredRef.current && bookId && pageCount) {
        restoredRef.current = true
        const saved = getProgress(bookId)
        if (saved?.currentPage && saved.currentPage > 1) {
          // Defer so PageFlip finishes init before turning.
          requestAnimationFrame(() => {
            goToPdfPage(saved.currentPage, { animate: false })
          })
        }
      }
    },
    [bookId, pageCount, goToPdfPage],
  )

  const onChangeOrientation = useCallback((event) => {
    if (event?.data) setOrientation(event.data)
  }, [])

  const onZoomIn = useCallback(() => {
    setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
  }, [])

  const onZoomOut = useCallback(() => {
    setZoomIndex((index) => Math.max(0, index - 1))
  }, [])

  const onToggleBookmark = useCallback(() => {
    toggleBookmark(currentPdfPage, `Page ${currentPdfPage}`)
  }, [toggleBookmark, currentPdfPage])

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        flipNext()
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        flipPrev()
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault()
        toggleFullscreen()
      } else if (event.key === 'b' || event.key === 'B') {
        event.preventDefault()
        onToggleBookmark()
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        onZoomIn()
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        onZoomOut()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flipNext, flipPrev, toggleFullscreen, onToggleBookmark, onZoomIn, onZoomOut])

  return (
    <div
      ref={rootRef}
      className={`flex min-h-[calc(100dvh-5.5rem)] flex-col ${
        isFullscreen ? 'min-h-dvh bg-ink-950 p-4 sm:p-6' : ''
      }`}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {!isFullscreen ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-gilt-bright"
            >
              <ArrowLeft className="size-4" />
              Library
            </Link>
          ) : null}
          <h1 className="mt-2 truncate font-display text-2xl text-ink-100 sm:text-3xl">
            {title || 'Untitled book'}
          </h1>
        </div>

        <div className="w-full max-w-xs sm:w-56">
          <ReadingProgressBar percent={percent} label={`${pdfPageLabel} · ${percent}%`} />
        </div>
      </div>

      {status === 'ready' && pageCount > 0 ? (
        <div className="mb-3">
          <ReaderToolbar
            pageCount={pageCount}
            currentPdfPage={currentPdfPage}
            canPrev={canPrev}
            canNext={canNext}
            zoom={zoomIndex}
            zoomLabel={zoomLabel}
            isFullscreen={isFullscreen}
            isBookmarked={bookmarked}
            bookmarksOpen={bookmarksOpen}
            bookmarkCount={bookmarks.length}
            onPrev={flipPrev}
            onNext={flipNext}
            onGoToPage={(page) => goToPdfPage(page, { animate: true })}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onToggleFullscreen={toggleFullscreen}
            onToggleBookmark={onToggleBookmark}
            onToggleBookmarksPanel={() => setBookmarksOpen((open) => !open)}
          />
        </div>
      ) : null}

      <div
        ref={stageRef}
        className="relative flex min-h-[55dvh] flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/6 bg-ink-950/40 px-3 py-6 sm:px-6"
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
              startPage={flipIndex}
              flipBookRef={flipBookRef}
              onFlip={onFlip}
              onInit={onInit}
              onChangeOrientation={onChangeOrientation}
            />
          </PdfReaderProvider>
        ) : null}

        <BookmarksPanel
          open={bookmarksOpen}
          bookmarks={bookmarks}
          onClose={() => setBookmarksOpen(false)}
          onGoTo={(page) => {
            goToPdfPage(page, { animate: true })
            setBookmarksOpen(false)
          }}
          onRemove={remove}
        />
      </div>

      <p className="mt-4 text-center text-xs text-ink-500">
        Drag corners to flip · arrows to navigate · B bookmark · F fullscreen · +/- zoom
      </p>
    </div>
  )
}
