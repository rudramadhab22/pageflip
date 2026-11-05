import { useCallback } from 'react'
import { pdfPageToFlipIndex } from '../lib/readerPages'

function getPageFlip(ref) {
  return ref.current?.pageFlip?.() || null
}

export function useFlipControls(flipBookRef, pageCount) {
  const flipNext = useCallback(() => {
    getPageFlip(flipBookRef)?.flipNext('top')
  }, [flipBookRef])

  const flipPrev = useCallback(() => {
    getPageFlip(flipBookRef)?.flipPrev('top')
  }, [flipBookRef])

  const goToPdfPage = useCallback(
    (pdfPage, { animate = true } = {}) => {
      const flip = getPageFlip(flipBookRef)
      if (!flip) return
      const index = pdfPageToFlipIndex(pdfPage, pageCount)
      if (animate) flip.flip(index, 'top')
      else flip.turnToPage(index)
    },
    [flipBookRef, pageCount],
  )

  const goToFlipIndex = useCallback(
    (index, { animate = false } = {}) => {
      const flip = getPageFlip(flipBookRef)
      if (!flip) return
      const safe = Math.min(pageCount + 1, Math.max(0, index))
      if (animate) flip.flip(safe, 'top')
      else flip.turnToPage(safe)
    },
    [flipBookRef, pageCount],
  )

  return { flipNext, flipPrev, goToPdfPage, goToFlipIndex }
}
