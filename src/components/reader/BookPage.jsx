import { useEffect, useRef, useState } from 'react'
import { usePdfReader } from '../../context/PdfReaderContext'
import { getCachedPageImage, setCachedPageImage } from '../../services/pageImageCache'
import { renderPageToDataUrl } from '../../services/pdfDocument'
import { enqueueRender } from '../../services/renderQueue'

/** Cover face content — parent must be a native <div> for react-pageflip refs. */
export function HardCoverContent({ title, subtitle, side = 'front' }) {
  return (
    <>
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
    </>
  )
}

/** PDF page content — parent must be a native <div> for react-pageflip refs. */
export function PdfPageContent({ pageNumber }) {
  const { pdf, cssWidth, absolutePage, bookId, renderProfile } = usePdfReader()
  const imgRef = useRef(null)
  const pixelRatio = renderProfile?.pixelRatio ?? 2
  const quality = renderProfile?.quality ?? 0.98
  const format = renderProfile?.format ?? 'png'
  const [imageUrl, setImageUrl] = useState(() =>
    getCachedPageImage(bookId, pageNumber, cssWidth, pixelRatio),
  )
  const [failed, setFailed] = useState(false)

  const radius = renderProfile?.radius ?? 5
  const near = Math.abs(pageNumber - (absolutePage || 1)) <= radius || pageNumber <= 6

  useEffect(() => {
    // Keep the previous bitmap visible while a sharper pass renders (prevents light blink).
    const cached = getCachedPageImage(bookId, pageNumber, cssWidth, pixelRatio)
    if (cached) {
      setImageUrl(cached)
      if (imgRef.current) imgRef.current.src = cached
    }
    setFailed(false)
  }, [bookId, pageNumber, cssWidth, pixelRatio])

  useEffect(() => {
    if (!pdf || !cssWidth || !near) return undefined

    const cached = getCachedPageImage(bookId, pageNumber, cssWidth, pixelRatio)
    if (cached) {
      setImageUrl(cached)
      if (imgRef.current) imgRef.current.src = cached
      return undefined
    }

    let cancelled = false
    const distance = Math.abs(pageNumber - (absolutePage || 1))

    enqueueRender(
      () =>
        renderPageToDataUrl(pdf, pageNumber, {
          cssWidth,
          pixelRatio,
          quality,
          format,
        }),
      { priority: distance <= 1 },
    )
      .then((result) => {
        if (cancelled) return
        setCachedPageImage(bookId, pageNumber, cssWidth, result.dataUrl, pixelRatio)
        setImageUrl(result.dataUrl)
        if (imgRef.current) imgRef.current.src = result.dataUrl
      })
      .catch((error) => {
        if (cancelled || error?.message === 'Render cancelled') return
        setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber, cssWidth, near, bookId, absolutePage, pixelRatio, quality, format])

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-paper"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.04),transparent_14px,transparent_calc(100%-12px),rgba(0,0,0,0.025))]"
      />

      {imageUrl ? (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={`Page ${pageNumber}`}
          draggable={false}
          className="relative h-full w-full object-contain select-none"
        />
      ) : (
        // Quiet paper — no page numbers (they were flashing through the spine).
        <div className="absolute inset-0 bg-paper" aria-hidden>
          {failed ? (
            <p className="absolute inset-x-0 bottom-6 text-center text-xs text-ink-700/40">
              Couldn’t print this page
            </p>
          ) : null}
        </div>
      )}
    </>
  )
}
