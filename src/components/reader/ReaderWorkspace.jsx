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

const ZOOM_STEPS = [0.75, 0.9, 1, 1.2, 1.45]

function computePageSize(containerWidth, containerHeight, aspect, zoom, viewMode, immersive) {
  const safeAspect = aspect > 0 ? aspect : 210 / 297
  const single = viewMode === 'single'
  const padX = immersive ? 16 : 32
  const padY = immersive ? 16 : 28
  const horizontalBudget = Math.max(280, containerWidth - padX)
  const verticalBudget = Math.max(340, containerHeight - padY)

  let pageWidth
  let pageHeight

  if (single) {
    // One readable leaf — use most of the viewport.
    pageWidth = Math.min(immersive ? 720 : 560, Math.floor(horizontalBudget * 0.92))
    pageHeight = Math.floor(pageWidth / safeAspect)
    if (pageHeight > verticalBudget) {
      pageHeight = Math.floor(verticalBudget)
      pageWidth = Math.floor(pageHeight * safeAspect)
    }
  } else {
    // Open spread — maximize while keeping both pages on screen.
    pageWidth = Math.min(immersive ? 640 : 520, Math.floor(horizontalBudget / 2.02))
    pageHeight = Math.floor(pageWidth / safeAspect)
    if (pageHeight > verticalBudget) {
      pageHeight = Math.floor(verticalBudget)
      pageWidth = Math.floor(pageHeight * safeAspect)
    }
  }

  pageWidth = Math.max(180, Math.round(pageWidth * zoom))
  pageHeight = Math.max(240, Math.round(pageHeight * zoom))

  return { pageWidth, pageHeight }
}

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

  const stageSize = useElementSize(stageRef)
  const debouncedSize = useDebouncedValue(stageSize, 140)
  const { pdf, pageCount, aspect, status, error } = usePdfDocument(blob)
  const { isFullscreen, toggle: toggleBrowserFullscreen, exit: exitBrowserFullscreen } =
    useFullscreen(rootRef)
  const { bookmarks, toggleBookmark, remove, isBookmarked } = useBookmarks(bookId)

  const [flipIndex, setFlipIndex] = useState(0)
  const [absolutePage, setAbsolutePage] = useState(1)
  const [windowAnchor, setWindowAnchor] = useState(1)
  const [orientation, setOrientation] = useState('landscape')
  const [zoomIndex, setZoomIndex] = useState(2)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [viewMode, setViewMode] = useState('spread')

  const zoom = ZOOM_STEPS[zoomIndex]
  const zoomLabel = `${Math.round(zoom * 100)}%`
  const expanded = immersive || isFullscreen

  const windowMeta = useMemo(
    () => computePageWindow(pageCount || 0, windowAnchor),
    [pageCount, windowAnchor],
  )
  windowMetaRef.current = windowMeta

  const { flipNext, flipPrev, goToFlipIndex } = useFlipControls(
    flipBookRef,
    windowMeta.pages.length,
  )

  const sizeSource = debouncedSize.width ? debouncedSize : stageSize
  const { pageWidth, pageHeight } = useMemo(
    () =>
      computePageSize(
        sizeSource.width || 1100,
        sizeSource.height || 760,
        aspect,
        zoom,
        viewMode,
        expanded,
      ),
    [sizeSource.width, sizeSource.height, aspect, zoom, viewMode, expanded],
  )

  const renderProfile = useMemo(() => {
    const large = pageCount > LARGE_PAGE_COUNT_WARN
    return {
      radius: large ? 3 : 5,
      pixelRatio: Math.min(expanded ? 2.25 : 2, window.devicePixelRatio || 1),
      quality: large ? 0.88 : 0.94,
    }
  }, [pageCount, expanded])

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

  const goLibrary = useCallback(() => {
    if (document.fullscreenElement) {
      exitBrowserFullscreen()
    }
    onImmersiveChange?.(false)
    navigate('/')
  }, [navigate, exitBrowserFullscreen, onImmersiveChange])

  const toggleExpand = useCallback(async () => {
    if (expanded) {
      onImmersiveChange?.(false)
      if (document.fullscreenElement) await exitBrowserFullscreen()
      return
    }
    onImmersiveChange?.(true)
    await toggleBrowserFullscreen()
  }, [expanded, onImmersiveChange, exitBrowserFullscreen, toggleBrowserFullscreen])

  useEffect(() => {
    clearPageImageCache(bookId)
    clearRenderQueue()
    restoredRef.current = false
    pendingJumpRef.current = null
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

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) onImmersiveChange?.(false)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [onImmersiveChange])

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
      setFlipIndex(relative)
      syncAbsoluteFromFlip(relative)
    },
    [syncAbsoluteFromFlip],
  )

  const onInit = useCallback(
    (event) => {
      const relative = typeof event?.data?.page === 'number' ? event.data.page : 0
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
        toggleExpand()
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
  }, [onNext, onPrev, toggleExpand, onToggleBookmark, onZoomIn, onZoomOut, expanded])

  const largeNotice =
    !expanded && pageCount >= LARGE_PAGE_COUNT_WARN
      ? `Large document (${pageCount} pages). Nearby pages render progressively.`
      : !expanded && windowMeta.windowed
        ? `Showing pages ${windowMeta.start}–${windowMeta.end} of ${pageCount}.`
        : null

  return (
    <div
      ref={rootRef}
      className={`reader-workspace relative flex flex-col ${
        expanded
          ? 'fixed inset-0 z-[90] min-h-dvh bg-[#0a0c10]'
          : 'min-h-[calc(100dvh-5.5rem)]'
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
          onClick={toggleExpand}
          className="absolute top-4 right-4 z-[95] inline-flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 px-3 py-2 text-sm text-ink-100 backdrop-blur-md transition hover:border-gilt/40 hover:text-gilt-bright"
        >
          <Minimize2 className="size-4" />
          Exit
        </button>
      )}

      <div
        ref={stageRef}
        className={`relative z-10 flex flex-1 items-center justify-center overflow-hidden ${
          expanded
            ? 'min-h-0 bg-[#0a0c10] px-2 py-2 sm:px-4 sm:py-4'
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

        {status === 'ready' && pageCount > 0 && pdf ? (
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
              startPage={flipIndex}
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
          Drag to flip · arrows navigate · S single/spread · F expand · Esc exit expand
        </p>
      ) : null}
    </div>
  )
}
