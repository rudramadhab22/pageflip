/** Snap sizes so tiny resize noise does not remount the flip book. */
export function snapSize(value, step = 24) {
  if (!Number.isFinite(value) || value <= 0) return step
  return Math.max(step, Math.round(value / step) * step)
}

/**
 * Intrinsic page size for the flip engine.
 * Keep this stable across expand/collapse — viewport fitting is done with CSS scale.
 */
export function computeBookPageSize({
  aspect,
  zoom = 1,
  viewMode = 'spread',
}) {
  const safeAspect = aspect > 0 ? aspect : 210 / 297
  const single = viewMode === 'single'

  // Comfortable “print” size; zoom adjusts this, expand does not.
  let pageWidth = single ? 420 : 380
  pageWidth = Math.round(pageWidth * zoom)
  let pageHeight = Math.round(pageWidth / safeAspect)

  pageWidth = snapSize(Math.max(220, pageWidth))
  pageHeight = snapSize(Math.max(300, pageHeight))

  return { pageWidth, pageHeight }
}

export function computeFitScale({
  containerWidth,
  containerHeight,
  pageWidth,
  pageHeight,
  viewMode = 'spread',
  expanded = false,
}) {
  const single = viewMode === 'single'
  const bookW = single ? pageWidth * 1.08 : pageWidth * 2.08
  const bookH = pageHeight * 1.06
  const pad = expanded ? 24 : 32
  const availW = Math.max(200, (containerWidth || bookW) - pad)
  const availH = Math.max(200, (containerHeight || bookH) - pad)
  const scale = Math.min(availW / bookW, availH / bookH)
  // Avoid tiny/huge jumps from bad measurements.
  return Math.min(2.2, Math.max(0.45, Number.isFinite(scale) ? scale : 1))
}
