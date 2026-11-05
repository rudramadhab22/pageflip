import { useCallback } from 'react'

function getPageFlip(ref) {
  const handle = ref?.current
  if (!handle) return null

  try {
    if (typeof handle.pageFlip === 'function') {
      return handle.pageFlip()
    }
    // Some builds expose the engine directly.
    if (typeof handle.flipNext === 'function') {
      return handle
    }
  } catch {
    return null
  }
  return null
}

export function useFlipControls(flipBookRef, pageCount) {
  const flipNext = useCallback(() => {
    const flip = getPageFlip(flipBookRef)
    if (!flip) return
    try {
      if (typeof flip.flipNext === 'function') flip.flipNext('top')
      else flip.turnToNextPage()
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
      if (typeof flip.flipPrev === 'function') flip.flipPrev('top')
      else flip.turnToPrevPage()
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
      const index = Math.min(pageCount + 1, Math.max(0, Math.round(pdfPage)))
      try {
        if (animate && typeof flip.flip === 'function') flip.flip(index, 'top')
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
        if (animate && typeof flip.flip === 'function') flip.flip(safe, 'top')
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
