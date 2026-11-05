/** Front cover is flip index 0; PDF page N is index N; back cover is pageCount + 1. */

export function getCurrentPdfPage(flipIndex, pageCount) {
  if (!pageCount) return 1
  if (flipIndex <= 0) return 1
  if (flipIndex >= pageCount + 1) return pageCount
  return flipIndex
}

export function pdfPageToFlipIndex(pdfPage, pageCount) {
  if (!pageCount) return 0
  const page = Number(pdfPage)
  if (!Number.isFinite(page)) return 0
  return Math.min(pageCount + 1, Math.max(0, Math.round(page)))
}

export function describeFlipPosition(flipIndex, pageCount, orientation = 'landscape') {
  if (!pageCount) return '—'
  if (flipIndex <= 0) return 'Cover'
  if (flipIndex >= pageCount + 1) return 'Back cover'
  if (orientation === 'landscape') {
    const left = flipIndex
    const right = Math.min(pageCount, flipIndex + 1)
    if (left === right || flipIndex === pageCount) return `Page ${left}`
    return `Pages ${left}–${right}`
  }
  return `Page ${Math.min(pageCount, flipIndex)}`
}

export function readingPercent(flipIndex, pageCount) {
  if (!pageCount) return 0
  const current = getCurrentPdfPage(flipIndex, pageCount)
  return Math.round((current / pageCount) * 100)
}
