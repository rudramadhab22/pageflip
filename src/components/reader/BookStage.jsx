import { useMemo, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { coverPaletteFromId } from '../../lib/format'
import { HardCoverPage, PdfBookPage } from './BookPage'

/**
 * Realistic hardcover stage around react-pageflip.
 * Accepts a page window for large-PDF progressive mounting.
 */
export function BookStage({
  bookId,
  title,
  pages,
  pageCount,
  pageWidth,
  pageHeight,
  startPage = 0,
  windowed = false,
  flipBookRef,
  onFlip,
  onInit,
  onChangeOrientation,
  compactChrome = false,
}) {
  const palette = useMemo(() => coverPaletteFromId(bookId || title || 'book'), [bookId, title])
  const thickness = compactChrome
    ? 0
    : Math.min(28, Math.max(8, Math.round(pageCount / 12)))
  const localRef = useRef(null)
  const bookRef = flipBookRef || localRef
  const pageList = pages?.length ? pages : []

  return (
    <div className="book-stage relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-[40%] bg-gilt/10 blur-3xl"
      />

      <div
        className="relative mx-auto"
        style={{
          width: Math.min(pageWidth * 2 + thickness + 24, 1200),
          maxWidth: '100%',
        }}
      >
        {!compactChrome ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute top-[3%] bottom-[3%] rounded-r-sm max-sm:hidden"
              style={{
                right: 4,
                width: thickness,
                background: `linear-gradient(90deg, ${palette.spine}, #d9cfc0 35%, #f3ebe0 70%, #cfc4b4)`,
                boxShadow: '6px 10px 24px rgba(0,0,0,0.35)',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-[2%] bottom-[2%] left-1/2 z-0 w-3 -translate-x-1/2 rounded-sm max-sm:hidden"
              style={{
                background: `linear-gradient(180deg, ${palette.from}, ${palette.spine}, ${palette.to})`,
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
              }}
            />
          </>
        ) : null}

        <div
          className="relative z-10 mx-auto"
          style={{
            width: pageWidth * 2,
            maxWidth: '100%',
            filter: compactChrome
              ? 'drop-shadow(0 16px 24px rgba(0,0,0,0.45))'
              : 'drop-shadow(0 28px 40px rgba(0,0,0,0.55))',
          }}
        >
          <HTMLFlipBook
            key={`${bookId}-${pageList[0] || 0}-${pageList.length}-${Math.round(pageWidth)}x${Math.round(pageHeight)}`}
            ref={bookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={Math.min(220, pageWidth)}
            maxWidth={pageWidth}
            minHeight={Math.min(300, pageHeight)}
            maxHeight={pageHeight}
            startPage={startPage}
            drawShadow
            flippingTime={compactChrome ? 700 : 900}
            usePortrait
            startZIndex={1}
            autoSize={false}
            maxShadowOpacity={0.55}
            showCover
            showPageCorners={!compactChrome}
            mobileScrollSupport
            swipeDistance={20}
            clickEventForward={false}
            useMouseEvents
            renderOnlyPageLengthChange
            className="pageflip-book"
            style={{ margin: '0 auto' }}
            onFlip={onFlip}
            onInit={onInit}
            onChangeOrientation={onChangeOrientation}
          >
            <HardCoverPage
              title={title}
              subtitle={windowed ? 'Hardcover · progressive volume' : 'Hardcover edition'}
              side="front"
            />

            {pageList.map((pageNumber) => (
              <PdfBookPage key={pageNumber} pageNumber={pageNumber} />
            ))}

            <HardCoverPage
              title={title}
              subtitle={
                windowed && pageList[pageList.length - 1] < pageCount
                  ? 'Keep turning — more pages load ahead'
                  : 'End of volume'
              }
              side="back"
            />
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  )
}
