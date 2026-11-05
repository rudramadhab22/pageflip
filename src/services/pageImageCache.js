/** Shared in-memory page bitmaps for the active reader session. */
const store = new Map()

function keyFor(bookId, pageNumber, cssWidth) {
  return `${bookId || 'book'}::${pageNumber}::${Math.round(cssWidth)}`
}

export function getCachedPageImage(bookId, pageNumber, cssWidth) {
  return store.get(keyFor(bookId, pageNumber, cssWidth)) || null
}

export function setCachedPageImage(bookId, pageNumber, cssWidth, dataUrl) {
  store.set(keyFor(bookId, pageNumber, cssWidth), dataUrl)
}

export function clearPageImageCache(bookId) {
  if (!bookId) {
    store.clear()
    return
  }
  for (const key of store.keys()) {
    if (key.startsWith(`${bookId}::`)) {
      store.delete(key)
    }
  }
}
