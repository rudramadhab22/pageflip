import {
  FULL_MOUNT_PAGE_LIMIT,
  PAGE_WINDOW_SHIFT_MARGIN,
  PAGE_WINDOW_SIZE,
} from './constants'

export function computePageWindow(pageCount, focusPage) {
  if (!pageCount || pageCount < 1) {
    return { start: 1, end: 0, windowed: false, pages: [] }
  }

  const focus = Math.min(pageCount, Math.max(1, focusPage || 1))

  if (pageCount <= FULL_MOUNT_PAGE_LIMIT) {
    return {
      start: 1,
      end: pageCount,
      windowed: false,
      pages: Array.from({ length: pageCount }, (_, i) => i + 1),
    }
  }

  const size = Math.min(PAGE_WINDOW_SIZE, pageCount)
  const half = Math.floor(size / 2)
  let start = Math.max(1, focus - half)
  let end = Math.min(pageCount, start + size - 1)
  start = Math.max(1, end - size + 1)

  return {
    start,
    end,
    windowed: true,
    pages: Array.from({ length: end - start + 1 }, (_, i) => start + i),
  }
}

export function shouldShiftWindow(windowMeta, focusPage, pageCount) {
  if (!windowMeta?.windowed) return false
  const focus = Math.min(pageCount, Math.max(1, focusPage || 1))
  const nearStart =
    focus <= windowMeta.start + PAGE_WINDOW_SHIFT_MARGIN && windowMeta.start > 1
  const nearEnd =
    focus >= windowMeta.end - PAGE_WINDOW_SHIFT_MARGIN && windowMeta.end < pageCount
  return nearStart || nearEnd
}

/** Flip index inside the mounted book → absolute PDF page (or null for covers). */
export function flipIndexToAbsolutePage(flipIndex, windowStart, windowLength, pageCount) {
  if (flipIndex <= 0) return null
  if (flipIndex >= windowLength + 1) return null
  const absolute = windowStart + flipIndex - 1
  return Math.min(pageCount, Math.max(1, absolute))
}

/** Absolute PDF page → flip index inside the mounted book. */
export function absolutePageToFlipIndex(absolutePage, windowStart, windowLength) {
  if (!absolutePage) return 0
  const relative = absolutePage - windowStart + 1
  return Math.min(windowLength + 1, Math.max(0, relative))
}
