import { useCallback } from 'react'
import { pdfPageToFlipIndex } from '../lib/readerPages'

function getPageFlip(ref) {
  try {
    return ref.current?.pageFlip?.() || null
  } catch {
    return null
  }
}

export function useFlipControls(flipBookRef, pageCount) {
  const flipNext = useCallback(() => {
    const flip = getPageFlip(flipBookRef)
    if (!flip) return
    try {
      flip.flipNext('top')
    } catch {
      try {
        flip.turnToNextPage()
      } catch {
        // ignore
      }
    }
  }, [flipBookRef])

  const flipPrev = useCallback(() => {
    const flip = getPageFlip(flipBookRef)
    if (!flip) return
    try {
      flip.flipPrev('top')
    } catch {
      try {
        flip.turnToPrevPage()
      } catch {
        // ignore
      }
    }
  }, [flipBookRef])

  const goToPdfPage = useCallback(
    (pdfPage, { animate = true } = {}) => {
      const flip = getPageFlip(flipBookRef)
      if (!flip) return
      const index = pdfPageToFlipIndex(pdfPage, pageCount)
      try {
        if (animate) flip.flip(index, 'top')
        else flip.turnToPage(index)
      } catch {
        try {
          flip.turnToPage(index)
        } catch {
          // ignore
        }
      }
    },
    [flipBookRef, pageCount],
  )

  const goToFlipIndex = useCallback(
    (index, { animate = false } = {}) => {
      const flip = getPageFlip(flipBookRef)
      if (!flip) return
      const safe = Math.min(pageCount + 1, Math.max(0, index))
      try {
        if (animate) flip.flip(safe, 'top')
        else flip.turnToPage(safe)
      } catch {
        try {
          flip.turnToPage(safe)
        } catch {
          // ignore
        }
      }
    },
    [flipBookRef, pageCount],
  )

  return { flipNext, flipPrev, goToPdfPage, goToFlipIndex }
}
