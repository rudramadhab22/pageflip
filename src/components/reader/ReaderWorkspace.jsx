import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minimize2 } from 'lucide-react'
import { PdfReaderProvider } from '../../context/PdfReaderContext'
import { LARGE_PAGE_COUNT_WARN } from '../../lib/constants'
import { useBookmarks } from '../../hooks/useBookmarks'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useElementSize } from '../../hooks/useElementSize'
import { useFlipControls } from '../../hooks/useFlipControls'
import { useFullscreen } from '../../hooks/useFullscreen'
import { usePdfDocument } from '../../hooks/usePdfDocument'
import { computeBookPageSize } from '../../lib/pageSize'
import {
  absolutePageToFlipIndex,
  computePageWindow,
  flipIndexToAbsolutePage,
  shouldShiftWindow,
} from '../../lib/pageWindow'
import { describeFlipPosition, readingPercent } from '../../lib/readerPages'
import { clearPageImageCache } from '../../services/pageImageCache'
import { clearRenderQueue } from '../../services/renderQueue'
import { getProgress, setProgress } from '../../services/readingProgress'
import { ErrorBanner } from '../ui/ErrorBanner'
import { Spinner } from '../ui/Spinner'
import { BookStage } from './BookStage'
import { BookmarksPanel } from './BookmarksPanel'
import { ReaderNotice } from './ReaderNotice'
import { ReaderToolbar } from './ReaderToolbar'
import { ReadingProgressBar } from './ReadingProgressBar'

const ZOOM_STEPS = [0.8, 0.9, 1, 1.15, 1.3]

export function ReaderWorkspace({
  bookId,
  blob,
  title,
  immersive = false,
  onImmersiveChange,
}) {
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const flipBookRef = useRef(null)
  const restoredRef = useRef(false)
  const pendingJumpRef = useRef(null)
  const windowMetaRef = useRef(null)
  const flipIndexRef = useRef(0)

  const stageSize = useElementSize(stageRef)
  const debouncedStage = useDebouncedValue(stageSize, 220)
  const { pdf, pageCount, aspect, status, error } = usePdfDocument(blob)
  const { enter: enterFs, exit: exitFs } = useFullscreen(rootRef)
  const { bookmarks, toggleBookmark, remove, isBookmarked } = useBookmarks(bookId)

  const [flipIndex, setFlipIndex] = useState(0)
  const [absolutePage, setAbsolutePage] = useState(1)
  const [windowAnchor, setWindowAnchor] = useState(1)
  const [orientation, setOrientation] = useState('landscape')
  const [zoomIndex, setZoomIndex] = useState(2)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [viewMode, setViewMode] = useState('spread')
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }))

  const expanded = Boolean(immersive)
  const zoom = ZOOM_STEPS[zoomIndex]
  const zoomLabel = `${Math.round(zoom * 100)}%`

  const windowMeta = useMemo(
    () => computePageWindow(pageCount || 0, windowAnchor),
    [pageCount, windowAnchor],
  )
  windowMetaRef.current = windowMeta

  const { flipNext, flipPrev, goToFlipIndex } = useFlipControls(
    flipBookRef,
    windowMeta.pages.length,
  )

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!expanded) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setViewport({ width: window.innerWidth, height: window.innerHeight })
    return () => {
      document.body.style.overflow = prev
    }
  }, [expanded])

  const layoutWidth = expanded
    ? viewport.width
    : debouncedStage.width || stageSize.width || viewport.width * 0.9
  const layoutHeight = expanded
    ? viewport.height
    : debouncedStage.height || stageSize.height || viewport.height * 0.7

  const { pageWidth, pageHeight } = useMemo(
    () =>
      computeBookPageSize({
        containerWidth: layoutWidth,
        containerHeight: layoutHeight,
        aspect,
        zoom,
        viewMode,
        expanded,
      }),
    [layoutWidth, layoutHeight, aspect, zoom, viewMode, expanded],
  )

  const renderProfile = useMemo(
    () => ({
      radius: pageCount > LARGE_PAGE_COUNT_WARN ? 3 : 5,
      pixelRatio: Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1.5 : 1.5),
      quality: 0.92,
    }),
    [pageCount],
  )

  const percent = readingPercent(absolutePage, pageCount)
  const displayLabel =
    flipIndex <= 0
      ? 'Cover'
      : flipIndex >= windowMeta.pages.length + 1
        ? windowMeta.end >= pageCount
          ? 'Back cover'
          : `Loading pages ${windowMeta.end + 1}+…`
        : viewMode === 'spread' && orientation === 'landscape'
          ? describeFlipPosition(absolutePage, pageCount, 'landscape')
          : `Page ${absolutePage}`

  const canPrev = !(flipIndex <= 0 && windowMeta.start <= 1)
  const canNext = !(flipIndex >= windowMeta.pages.length + 1 && windowMeta.end >= pageCount)
  const bookmarked = isBookmarked(absolutePage)

  const exitExpand = useCallback(async () => {
    onImmersiveChange?.(false)
    await exitFs()
  }, [onImmersiveChange, exitFs])

  const enterExpand = useCallback(async () => {
    onImmersiveChange?.(true)
    await enterFs()
  }, [onImmersiveChange, enterFs])

  const toggleExpand = useCallback(async () => {
    if (expanded) await exitExpand()
    else await enterExpand()
  }, [expanded, exitExpand, enterExpand])

  const goLibrary = useCallback(async () => {
    await exitExpand()
    navigate('/')
  }, [navigate, exitExpand])

  useEffect(() => {
    clearPageImageCache(bookId)
    clearRenderQueue()
    restoredRef.current = false
    pendingJumpRef.current = null
    flipIndexRef.current = 0
    setWindowAnchor(1)
    setAbsolutePage(1)
    setFlipIndex(0)
    return () => {
      clearPageImageCache(bookId)
      clearRenderQueue()
    }
  }, [bookId])

  useEffect(() => {
    if (!bookId || !pageCount) return
    setProgress(bookId, {
      currentPage: absolutePage,
      pageCount,
      percent,
    })
  }, [bookId, absolutePage, pageCount, percent])

  useEffect(() => {
    if (!pageCount) return
    if (shouldShiftWindow(windowMeta, absolutePage, pageCount)) {
      setWindowAnchor(absolutePage)
    }
  }, [absolutePage, pageCount, windowMeta])

  const syncAbsoluteFromFlip = useCallback(
    (relativeIndex) => {
      const meta = windowMetaRef.current
      if (!meta?.pages?.length) return
      const absolute = flipIndexToAbsolutePage(
        relativeIndex,
        meta.start,
        meta.pages.length,
        pageCount,
      )
      if (absolute) setAbsolutePage(absolute)
      else if (relativeIndex <= 0) setAbsolutePage(meta.start)
      else setAbsolutePage(meta.end)
    },
    [pageCount],
  )

  const jumpToAbsolutePage = useCallback(
    (page, { animate = true } = {}) => {
      if (!pageCount) return
      const target = Math.min(pageCount, Math.max(1, Math.round(page)))
      const meta = windowMetaRef.current
      if (!meta) return

      if (target < meta.start || target > meta.end) {
        pendingJumpRef.current = { page: target, animate }
        setWindowAnchor(target)
        setAbsolutePage(target)
        return
      }

      const index = absolutePageToFlipIndex(target, meta.start, meta.pages.length)
      setAbsolutePage(target)
      goToFlipIndex(index, { animate })
    },
    [pageCount, goToFlipIndex],
  )

  const onFlip = useCallback(
    (event) => {
      const relative = typeof event?.data === 'number' ? event.data : 0
      flipIndexRef.current = relative
      setFlipIndex(relative)
      syncAbsoluteFromFlip(relative)
    },
    [syncAbsoluteFromFlip],
  )

  const onInit = useCallback(
    (event) => {
      const relative = typeof event?.data?.page === 'number' ? event.data.page : 0
      flipIndexRef.current = relative
      setFlipIndex(relative)
      if (event?.data?.mode) setOrientation(event.data.mode)
      syncAbsoluteFromFlip(relative)

      const pending = pendingJumpRef.current
      if (pending) {
        pendingJumpRef.current = null
        const meta = windowMetaRef.current
        const index = absolutePageToFlipIndex(pending.page, meta.start, meta.pages.length)
        requestAnimationFrame(() => {
          goToFlipIndex(index, { animate: false })
          setAbsolutePage(pending.page)
          flipIndexRef.current = index
          setFlipIndex(index)
        })
        return
      }

      if (!restoredRef.current && bookId && pageCount) {
        restoredRef.current = true
        const saved = getProgress(bookId)
        if (saved?.currentPage && saved.currentPage > 1) {
          requestAnimationFrame(() => {
            jumpToAbsolutePage(saved.currentPage, { animate: false })
          })
        }
      }
    },
    [bookId, pageCount, syncAbsoluteFromFlip, goToFlipIndex, jumpToAbsolutePage],
  )

  const onChangeOrientation = useCallback((event) => {
    if (event?.data) setOrientation(event.data)
  }, [])

  const onPrev = useCallback(() => {
    if (flipIndex <= 0 && windowMeta.start > 1) {
      jumpToAbsolutePage(windowMeta.start - 1, { animate: false })
      return
    }
    flipPrev()
  }, [flipIndex, windowMeta.start, jumpToAbsolutePage, flipPrev])

  const onNext = useCallback(() => {
    if (flipIndex >= windowMeta.pages.length + 1 && windowMeta.end < pageCount) {
      jumpToAbsolutePage(windowMeta.end + 1, { animate: false })
      return
    }
    flipNext()
  }, [flipIndex, windowMeta.pages.length, windowMeta.end, pageCount, jumpToAbsolutePage, flipNext])

  const onZoomIn = useCallback(() => {
    setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
  }, [])

  const onZoomOut = useCallback(() => {
    setZoomIndex((index) => Math.max(0, index - 1))
  }, [])

  const onToggleBookmark = useCallback(() => {
    toggleBookmark(absolutePage, `Page ${absolutePage}`)
  }, [toggleBookmark, absolutePage])

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault()
        onPrev()
      } else if (event.key === 'Escape' && expanded) {
        event.preventDefault()
        exitExpand()
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault()
        toggleExpand()
      } else if (event.key === 'b' || event.key === 'B') {
        event.preventDefault()
        onToggleBookmark()
      } else if (event.key === 's' || event.key === 'S') {
        event.preventDefault()
        setViewMode((mode) => (mode === 'single' ? 'spread' : 'single'))
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
  }, [onNext, onPrev, toggleExpand, exitExpand, onToggleBookmark, onZoomIn, onZoomOut, expanded])

  const largeNotice =
    !expanded && pageCount >= LARGE_PAGE_COUNT_WARN
      ? `Large document (${pageCount} pages). Nearby pages render progressively.`
      : !expanded && windowMeta.windowed
        ? `Showing pages ${windowMeta.start}–${windowMeta.end} of ${pageCount}.`
        : null

  // Preserve place across intentional remounts (zoom / view / size bucket).
  const startPage = flipIndexRef.current

  const bookReady = status === 'ready' && pageCount > 0 && pdf && pageWidth > 0 && pageHeight > 0

  return (
    <div
      ref={rootRef}
      className={`reader-workspace relative flex flex-col ${
        expanded ? 'is-expanded' : 'min-h-[calc(100dvh-5.5rem)]'
      }`}
    >
      {!expanded ? (
        <>
          <div className="relative z-[70] mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={goLibrary}
                className="relative z-[71] inline-flex items-center gap-2 text-sm text-ink-300 transition hover:text-gilt-bright"
              >
                <ArrowLeft className="size-4" />
                Library
              </button>
              <h1 className="mt-2 truncate font-display text-2xl text-ink-100 sm:text-3xl">
                {title || 'Untitled book'}
              </h1>
            </div>

            <div className="w-full max-w-xs sm:w-56">
              <ReadingProgressBar percent={percent} label={`${displayLabel} · ${percent}%`} />
            </div>
          </div>

          <ReaderNotice>{largeNotice}</ReaderNotice>

          {status === 'ready' && pageCount > 0 ? (
            <div className="relative z-[70] mb-3">
              <ReaderToolbar
                pageCount={pageCount}
                currentPdfPage={absolutePage}
                canPrev={canPrev}
                canNext={canNext}
                zoom={zoomIndex}
                zoomLabel={zoomLabel}
                isFullscreen={expanded}
                isBookmarked={bookmarked}
                bookmarksOpen={bookmarksOpen}
                bookmarkCount={bookmarks.length}
                viewMode={viewMode}
                onPrev={onPrev}
                onNext={onNext}
                onGoToPage={(page) => jumpToAbsolutePage(page, { animate: true })}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onToggleFullscreen={toggleExpand}
                onToggleBookmark={onToggleBookmark}
                onToggleBookmarksPanel={() => setBookmarksOpen((open) => !open)}
                onViewModeChange={setViewMode}
              />
            </div>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={exitExpand}
          className="absolute top-4 right-4 z-[120] inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-sm text-ink-100 backdrop-blur-md transition hover:border-gilt/40 hover:text-gilt-bright"
        >
          <Minimize2 className="size-4" />
          Exit
        </button>
      )}

      <div
        ref={stageRef}
        className={`relative z-10 flex flex-1 items-center justify-center overflow-hidden ${
          expanded
            ? 'h-full min-h-0 w-full px-3 py-3 sm:px-5 sm:py-5'
            : 'min-h-[58dvh] rounded-[1.25rem] border border-white/6 bg-ink-950/40 px-2 py-4 sm:min-h-[62dvh] sm:rounded-[1.5rem] sm:px-6 sm:py-6'
        }`}
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

        {bookReady ? (
          <PdfReaderProvider
            pdf={pdf}
            pageCount={pageCount}
            cssWidth={pageWidth}
            flipIndex={flipIndex}
            absolutePage={absolutePage}
            title={title}
            bookId={bookId}
            renderProfile={renderProfile}
          >
            <BookStage
              bookId={bookId}
              title={title}
              pages={windowMeta.pages}
              pageCount={pageCount}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              startPage={startPage}
              windowed={windowMeta.windowed}
              viewMode={viewMode}
              immersive={expanded}
              flipBookRef={flipBookRef}
              onFlip={onFlip}
              onInit={onInit}
              onChangeOrientation={onChangeOrientation}
            />
          </PdfReaderProvider>
        ) : null}

        {!expanded ? (
          <BookmarksPanel
            open={bookmarksOpen}
            bookmarks={bookmarks}
            onClose={() => setBookmarksOpen(false)}
            onGoTo={(page) => {
              jumpToAbsolutePage(page, { animate: true })
              setBookmarksOpen(false)
            }}
            onRemove={remove}
          />
        ) : null}
      </div>

      {!expanded ? (
        <p className="relative z-[70] mt-3 text-center text-xs text-ink-500 sm:mt-4">
          Drag a corner to turn pages · arrows navigate · S single/spread · F expand
        </p>
      ) : null}
    </div>
  )
}
