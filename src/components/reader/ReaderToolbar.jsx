import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Notebook,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useState } from 'react'

function IconBtn({ label, onClick, disabled, active, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-10 items-center justify-center rounded-xl border transition ${
        active
          ? 'border-gilt/40 bg-gilt/15 text-gilt-bright'
          : 'border-white/8 bg-ink-850 text-ink-100 hover:border-white/14 hover:bg-ink-800'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export function ReaderToolbar({
  pageCount,
  currentPdfPage,
  canPrev,
  canNext,
  zoom,
  zoomLabel,
  isFullscreen,
  isBookmarked,
  bookmarksOpen,
  bookmarkCount,
  viewMode,
  onPrev,
  onNext,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleBookmark,
  onToggleBookmarksPanel,
  onViewModeChange,
  compact = false,
}) {
  const [draftPage, setDraftPage] = useState(String(currentPdfPage || 1))

  useEffect(() => {
    setDraftPage(String(currentPdfPage || 1))
  }, [currentPdfPage])

  const submitPage = (event) => {
    event.preventDefault()
    const next = Number.parseInt(draftPage, 10)
    if (!Number.isFinite(next)) {
      setDraftPage(String(currentPdfPage || 1))
      return
    }
    onGoToPage(Math.min(pageCount, Math.max(1, next)))
  }

  return (
    <div
      className={`relative z-[70] flex flex-col gap-3 rounded-2xl border border-white/8 bg-ink-900/90 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between ${
        compact ? 'pointer-events-auto' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <IconBtn label="Previous page" onClick={onPrev} disabled={!canPrev}>
          <ChevronLeft className="size-5" />
        </IconBtn>

        <form onSubmit={submitPage} className="flex items-center gap-2">
          <label className="sr-only" htmlFor="pageflip-page-input">
            Page number
          </label>
          <input
            id="pageflip-page-input"
            type="number"
            min={1}
            max={pageCount || 1}
            value={draftPage}
            onChange={(event) => setDraftPage(event.target.value)}
            className="h-10 w-16 rounded-xl border border-white/10 bg-ink-850 px-2 text-center text-sm text-ink-100 outline-none focus:border-gilt/50"
          />
          <span className="text-sm text-ink-500">/ {pageCount || '—'}</span>
        </form>

        <IconBtn label="Next page" onClick={onNext} disabled={!canNext}>
          <ChevronRight className="size-5" />
        </IconBtn>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <IconBtn
          label="Open book (two pages)"
          onClick={() => onViewModeChange?.('spread')}
          active={viewMode === 'spread'}
        >
          <BookOpen className="size-4" />
        </IconBtn>
        <IconBtn
          label="Single folded page"
          onClick={() => onViewModeChange?.('single')}
          active={viewMode === 'single'}
        >
          <Notebook className="size-4" />
        </IconBtn>

        <IconBtn label="Zoom out" onClick={onZoomOut} disabled={zoom <= 0}>
          <ZoomOut className="size-4" />
        </IconBtn>
        <span className="min-w-12 text-center text-xs tracking-wide text-ink-300 uppercase">
          {zoomLabel}
        </span>
        <IconBtn label="Zoom in" onClick={onZoomIn} disabled={zoom >= 4}>
          <ZoomIn className="size-4" />
        </IconBtn>

        <IconBtn
          label={isBookmarked ? 'Remove bookmark' : 'Bookmark page'}
          onClick={onToggleBookmark}
          active={isBookmarked}
        >
          {isBookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        </IconBtn>

        <IconBtn
          label="Open bookmarks"
          onClick={onToggleBookmarksPanel}
          active={bookmarksOpen}
        >
          <span className="relative">
            <Bookmark className="size-4 opacity-70" />
            {bookmarkCount > 0 ? (
              <span className="absolute -top-2 -right-2 grid min-w-4 place-items-center rounded-full bg-gilt px-1 text-[9px] font-semibold text-ink-950">
                {bookmarkCount > 9 ? '9+' : bookmarkCount}
              </span>
            ) : null}
          </span>
        </IconBtn>

        <IconBtn
          label={isFullscreen ? 'Exit expand' : 'Expand book'}
          onClick={onToggleFullscreen}
          active={isFullscreen}
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </IconBtn>
      </div>
    </div>
  )
}
