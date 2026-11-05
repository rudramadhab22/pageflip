import { PAGE_IMAGE_CACHE_LIMIT } from '../lib/constants'

/** LRU in-memory page bitmaps for the active reader session. */
const store = new Map()

function keyFor(bookId, pageNumber, cssWidth) {
  return `${bookId || 'book'}::${pageNumber}::${Math.round(cssWidth)}`
}

function touch(key, value) {
  if (store.has(key)) store.delete(key)
  store.set(key, value)
  while (store.size > PAGE_IMAGE_CACHE_LIMIT) {
    const oldest = store.keys().next().value
    store.delete(oldest)
  }
}

export function getCachedPageImage(bookId, pageNumber, cssWidth) {
  const key = keyFor(bookId, pageNumber, cssWidth)
  if (!store.has(key)) return null
  const value = store.get(key)
  touch(key, value)
  return value
}

export function setCachedPageImage(bookId, pageNumber, cssWidth, dataUrl) {
  touch(keyFor(bookId, pageNumber, cssWidth), dataUrl)
}

export function clearPageImageCache(bookId) {
  if (!bookId) {
    store.clear()
    return
  }
  for (const key of [...store.keys()]) {
    if (key.startsWith(`${bookId}::`)) store.delete(key)
  }
}

export function getPageImageCacheSize() {
  return store.size
}
