/** Snap sizes so tiny resize noise does not remount the flip book. */
export function snapSize(value, step = 16) {
  if (!Number.isFinite(value) || value <= 0) return step
  return Math.max(step, Math.round(value / step) * step)
}

export function computeBookPageSize({
  containerWidth,
  containerHeight,
  aspect,
  zoom = 1,
  viewMode = 'spread',
  expanded = false,
}) {
  const safeAspect = aspect > 0 ? aspect : 210 / 297
  const single = viewMode === 'single'
  const padX = expanded ? 28 : 40
  const padY = expanded ? 56 : 36
  const horizontalBudget = Math.max(300, (containerWidth || 1000) - padX)
  const verticalBudget = Math.max(340, (containerHeight || 700) - padY)

  let pageWidth
  let pageHeight

  if (single) {
    pageWidth = Math.floor(horizontalBudget * (expanded ? 0.94 : 0.86))
    pageHeight = Math.floor(pageWidth / safeAspect)
  } else {
    pageWidth = Math.floor(horizontalBudget / 2.05)
    pageHeight = Math.floor(pageWidth / safeAspect)
  }

  if (pageHeight > verticalBudget) {
    pageHeight = Math.floor(verticalBudget)
    pageWidth = Math.floor(pageHeight * safeAspect)
  }

  pageWidth = snapSize(Math.max(200, pageWidth * zoom))
  pageHeight = snapSize(Math.max(280, pageHeight * zoom))

  return { pageWidth, pageHeight }
}
