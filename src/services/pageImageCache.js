import { PAGE_IMAGE_CACHE_LIMIT } from '../lib/constants'

/** LRU in-memory page bitmaps for the active reader session. */
const store = new Map()

function keyFor(bookId, pageNumber, cssWidth, pixelRatio = 1) {
  // Include pixel density so CSS-upscaled pages can cache a sharper bitmap.
  const px = Math.round((cssWidth || 0) * (pixelRatio || 1))
  return `${bookId || 'book'}::${pageNumber}::${px}`
}

function touch(key, value) {
  if (store.has(key)) store.delete(key)
  store.set(key, value)
  while (store.size > PAGE_IMAGE_CACHE_LIMIT) {
    const oldest = store.keys().next().value
    store.delete(oldest)
  }
}

export function getCachedPageImage(bookId, pageNumber, cssWidth, pixelRatio = 1) {
  const key = keyFor(bookId, pageNumber, cssWidth, pixelRatio)
  if (!store.has(key)) return null
  const value = store.get(key)
  touch(key, value)
  return value
}

export function setCachedPageImage(bookId, pageNumber, cssWidth, dataUrl, pixelRatio = 1) {
  touch(keyFor(bookId, pageNumber, cssWidth, pixelRatio), dataUrl)
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
