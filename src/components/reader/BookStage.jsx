import { useMemo, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { coverPaletteFromId } from '../../lib/format'
import { HardCoverPage, PdfBookPage } from './BookPage'

/**
 * Realistic hardcover stage.
 * viewMode: 'spread' (open book) | 'single' (one page up, other half folded).
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
  viewMode = 'spread',
  flipBookRef,
  onFlip,
  onInit,
  onChangeOrientation,
  immersive = false,
}) {
  const palette = useMemo(() => coverPaletteFromId(bookId || title || 'book'), [bookId, title])
  const single = viewMode === 'single'
  const thickness = single
    ? Math.min(18, Math.max(6, Math.round(pageCount / 18)))
    : Math.min(28, Math.max(8, Math.round(pageCount / 12)))
  const localRef = useRef(null)
  const bookRef = flipBookRef || localRef
  const pageList = pages?.length ? pages : []

  const shellWidth = single ? pageWidth + thickness + 18 : pageWidth * 2 + thickness + 24
  const bookWidth = single ? pageWidth : pageWidth * 2

  return (
    <div className={`book-stage relative mx-auto w-full ${immersive ? 'max-w-none' : 'max-w-6xl'}`}>
      {!immersive ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[8%] rounded-[40%] bg-gilt/10 blur-3xl"
        />
      ) : null}

      <div
        className="relative mx-auto"
        style={{
          width: Math.min(shellWidth, immersive ? 1600 : 1280),
          maxWidth: '100%',
        }}
      >
        {/* Folded stack / page thickness */}
        <div
          aria-hidden
          className={`pointer-events-none absolute top-[2.5%] bottom-[2.5%] rounded-sm ${
            single ? 'left-0' : 'right-1'
          }`}
          style={{
            width: thickness,
            background: single
              ? `linear-gradient(90deg, ${palette.spine}, #cfc4b4 40%, #f3ebe0 78%, #e7ddd0)`
              : `linear-gradient(90deg, ${palette.spine}, #d9cfc0 35%, #f3ebe0 70%, #cfc4b4)`,
            boxShadow: single
              ? 'inset -2px 0 0 rgba(0,0,0,0.15), 4px 8px 18px rgba(0,0,0,0.35)'
              : '6px 10px 24px rgba(0,0,0,0.35)',
            transform: single ? 'translateX(0)' : undefined,
          }}
        />

        {single ? (
          <div
            aria-hidden
            className="pointer-events-none absolute top-[4%] bottom-[4%] left-[2px] z-[1] w-[42%] origin-left rounded-sm"
            style={{
              background: `linear-gradient(105deg, ${palette.from} 0%, ${palette.to} 55%, ${palette.spine})`,
              transform: 'perspective(900px) rotateY(-78deg) scaleX(0.42)',
              transformOrigin: 'left center',
              boxShadow: '10px 12px 28px rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute top-[2%] bottom-[2%] left-1/2 z-0 w-3 -translate-x-1/2 rounded-sm max-sm:hidden"
            style={{
              background: `linear-gradient(180deg, ${palette.from}, ${palette.spine}, ${palette.to})`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            }}
          />
        )}

        <div
          className="relative z-10 mx-auto"
          style={{
            width: bookWidth,
            maxWidth: '100%',
            marginLeft: single ? thickness + 4 : undefined,
            filter: 'drop-shadow(0 28px 40px rgba(0,0,0,0.55))',
          }}
        >
          <HTMLFlipBook
            key={`${bookId}-${viewMode}-${pageList[0] || 0}-${pageList.length}-${Math.round(pageWidth)}x${Math.round(pageHeight)}`}
            ref={bookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={Math.min(200, pageWidth)}
            maxWidth={pageWidth}
            minHeight={Math.min(280, pageHeight)}
            maxHeight={pageHeight}
            startPage={startPage}
            drawShadow
            flippingTime={850}
            usePortrait
            startZIndex={1}
            autoSize={false}
            maxShadowOpacity={0.7}
            showCover
            showPageCorners
            mobileScrollSupport
            swipeDistance={18}
            clickEventForward={false}
            useMouseEvents
            disableFlipByClick={false}
            renderOnlyPageLengthChange
            className={`pageflip-book ${single ? 'pageflip-book--single' : 'pageflip-book--spread'}`}
            style={{
              margin: '0 auto',
              // Parent width < 2*pageWidth forces StPageFlip into single-page (folded) mode.
              width: single ? pageWidth : pageWidth * 2,
              maxWidth: '100%',
            }}
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
