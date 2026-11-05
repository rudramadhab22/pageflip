import { forwardRef, useEffect, useState } from 'react'
import { usePdfReader } from '../../context/PdfReaderContext'
import { getCachedPageImage, setCachedPageImage } from '../../services/pageImageCache'
import { renderPageToDataUrl } from '../../services/pdfDocument'
import { Spinner } from '../ui/Spinner'

const RENDER_RADIUS = 4

export const HardCoverPage = forwardRef(function HardCoverPage(
  { title, subtitle, side = 'front' },
  ref,
) {
  return (
    <div
      ref={ref}
      data-density="hard"
      className="book-page book-page--cover relative h-full w-full overflow-hidden bg-gradient-to-br from-[#6a3f28] via-leather to-leather-deep text-paper shadow-[inset_0_0_40px_rgba(0,0,0,0.35)]"
    >
      <div
        aria-hidden
        className={`absolute inset-y-0 w-4 bg-gradient-to-r ${
          side === 'front'
            ? 'left-0 from-black/45 to-transparent'
            : 'right-0 from-transparent to-black/45'
        }`}
      />
      <div className="absolute inset-5 rounded-sm border border-gilt/35" />
      <div className="absolute inset-8 rounded-sm border border-gilt/15" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-[10px] tracking-[0.28em] text-gilt/70 uppercase">PageFlip</p>
        <h2 className="mt-4 font-display text-3xl leading-tight text-gilt-bright text-balance sm:text-4xl">
          {title || 'Untitled'}
        </h2>
        {subtitle ? <p className="mt-3 text-xs tracking-wide text-paper/65">{subtitle}</p> : null}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.45\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
})

export const PdfBookPage = forwardRef(function PdfBookPage({ pageNumber }, ref) {
  const { pdf, cssWidth, flipIndex, bookId } = usePdfReader()
  const [imageUrl, setImageUrl] = useState(() =>
    getCachedPageImage(bookId, pageNumber, cssWidth),
  )
  const [isRendering, setIsRendering] = useState(false)

  // flipIndex 0 = cover; PDF page N lives at flip index N
  const near =
    Math.abs(pageNumber - Math.max(1, flipIndex)) <= RENDER_RADIUS ||
    Math.abs(pageNumber - (flipIndex + 1)) <= RENDER_RADIUS

  useEffect(() => {
    setImageUrl(getCachedPageImage(bookId, pageNumber, cssWidth))
  }, [bookId, pageNumber, cssWidth])

  useEffect(() => {
    if (!pdf || !cssWidth || !near) return undefined
    if (getCachedPageImage(bookId, pageNumber, cssWidth)) {
      setImageUrl(getCachedPageImage(bookId, pageNumber, cssWidth))
      return undefined
    }

    let cancelled = false
    setIsRendering(true)

    renderPageToDataUrl(pdf, pageNumber, {
      cssWidth,
      pixelRatio: Math.min(2, window.devicePixelRatio || 1),
    })
      .then((result) => {
        if (cancelled) return
        setCachedPageImage(bookId, pageNumber, cssWidth, result.dataUrl)
        setImageUrl(result.dataUrl)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsRendering(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber, cssWidth, near, bookId])

  return (
    <div
      ref={ref}
      data-density="soft"
      className="book-page book-page--paper relative h-full w-full overflow-hidden bg-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.06),transparent_18px,transparent_calc(100%-14px),rgba(0,0,0,0.03))]"
      />

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Page ${pageNumber}`}
          draggable={false}
          className="relative h-full w-full object-contain select-none"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 text-ink-700">
          {isRendering ? <Spinner label={`Rendering page ${pageNumber}`} /> : null}
          <p className="font-display text-2xl text-ink-700/40">{pageNumber}</p>
          <p className="text-xs tracking-wide text-ink-700/35 uppercase">
            {isRendering ? 'Printing page…' : 'Paper ready'}
          </p>
        </div>
      )}

      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-black/10" />
    </div>
  )
})
