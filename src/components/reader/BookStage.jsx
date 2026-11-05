import { useCallback, useMemo, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { coverPaletteFromId } from '../../lib/format'
import { HardCoverContent, PdfPageContent } from './BookPage'

/**
 * Hardcover flip stage.
 * - Native <div> children (React 19 + react-pageflip ref requirement)
 * - Memoized children so page-flip does not wipe refs on every parent render
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
    ? Math.min(16, Math.max(6, Math.round(pageCount / 20)))
    : Math.min(24, Math.max(8, Math.round(pageCount / 14)))
  const localRef = useRef(null)
  const pageList = pages?.length ? pages : []

  const setBookRef = useCallback(
    (instance) => {
      localRef.current = instance
      if (flipBookRef) flipBookRef.current = instance
    },
    [flipBookRef],
  )

  const bookKey = `${bookId}:${viewMode}:${pageList[0] || 0}:${pageList.length}:${pageWidth}x${pageHeight}`
  const shellWidth = single ? pageWidth + thickness + 12 : pageWidth * 2 + thickness + 16
  const bookWidth = single ? pageWidth : pageWidth * 2

  const flipChildren = useMemo(() => {
    const nodes = [
      <div
        key="cover-front"
        data-density="hard"
        className="book-page book-page--cover relative h-full w-full overflow-hidden bg-gradient-to-br from-[#6a3f28] via-leather to-leather-deep text-paper"
      >
        <HardCoverContent
          title={title}
          subtitle={windowed ? 'Progressive hardcover' : 'Hardcover edition'}
          side="front"
        />
      </div>,
    ]

    for (const pageNumber of pageList) {
      nodes.push(
        <div
          key={`p-${pageNumber}`}
          data-density="soft"
          className="book-page book-page--paper relative h-full w-full overflow-hidden bg-paper"
        >
          <PdfPageContent pageNumber={pageNumber} />
        </div>,
      )
    }

    nodes.push(
      <div
        key="cover-back"
        data-density="hard"
        className="book-page book-page--cover relative h-full w-full overflow-hidden bg-gradient-to-br from-[#6a3f28] via-leather to-leather-deep text-paper"
      >
        <HardCoverContent
          title={title}
          subtitle={
            windowed && pageList[pageList.length - 1] < pageCount
              ? 'More pages ahead'
              : 'End of volume'
          }
          side="back"
        />
      </div>,
    )

    return nodes
  }, [pageList, title, windowed, pageCount])

  return (
    <div className={`book-stage relative mx-auto w-full ${immersive ? 'max-w-none' : 'max-w-6xl'}`}>
      <div className="relative mx-auto" style={{ width: shellWidth, maxWidth: '100%' }}>
        <div
          aria-hidden
          className={`pointer-events-none absolute top-[2.5%] bottom-[2.5%] rounded-sm ${
            single ? 'left-0' : 'right-0'
          }`}
          style={{
            width: thickness,
            background: single
              ? `linear-gradient(90deg, ${palette.spine}, #cfc4b4 40%, #f3ebe0 78%, #e7ddd0)`
              : `linear-gradient(90deg, ${palette.spine}, #d9cfc0 35%, #f3ebe0 70%, #cfc4b4)`,
            boxShadow: '4px 10px 22px rgba(0,0,0,0.35)',
          }}
        />

        {single ? (
          <div
            aria-hidden
            className="pointer-events-none absolute top-[5%] bottom-[5%] left-0 z-[1] w-[38%]"
            style={{
              background: `linear-gradient(105deg, ${palette.from} 0%, ${palette.to} 55%, ${palette.spine})`,
              transform: 'perspective(900px) rotateY(-72deg)',
              transformOrigin: 'left center',
              boxShadow: '8px 10px 24px rgba(0,0,0,0.4)',
            }}
          />
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute top-[2%] bottom-[2%] left-1/2 z-0 w-2.5 -translate-x-1/2 rounded-sm"
            style={{
              background: `linear-gradient(180deg, ${palette.from}, ${palette.spine}, ${palette.to})`,
              boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
            }}
          />
        )}

        <div
          className="relative z-10 mx-auto"
          style={{
            width: bookWidth,
            maxWidth: '100%',
            marginLeft: single ? thickness + 2 : 0,
            filter: 'drop-shadow(0 24px 36px rgba(0,0,0,0.5))',
          }}
        >
          <HTMLFlipBook
            key={bookKey}
            ref={setBookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            startPage={startPage}
            drawShadow
            flippingTime={800}
            usePortrait={single}
            startZIndex={2}
            autoSize={false}
            maxShadowOpacity={0.65}
            showCover
            showPageCorners
            mobileScrollSupport
            swipeDistance={12}
            clickEventForward={false}
            useMouseEvents
            disableFlipByClick={false}
            renderOnlyPageLengthChange
            className={`pageflip-book ${single ? 'pageflip-book--single' : 'pageflip-book--spread'}`}
            style={{ margin: '0 auto', width: bookWidth }}
            onFlip={onFlip}
            onInit={onInit}
            onChangeOrientation={onChangeOrientation}
          >
            {flipChildren}
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  )
}
