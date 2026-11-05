import { STORAGE_KEYS } from '../lib/constants'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.bookmarks)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(map))
}

export function getBookmarks(bookId) {
  const list = readAll()[bookId]
  return Array.isArray(list) ? list : []
}

export function addBookmark(bookId, bookmark) {
  const map = readAll()
  const existing = Array.isArray(map[bookId]) ? map[bookId] : []
  const next = [
    {
      id: bookmark.id || `bm_${Date.now()}`,
      page: bookmark.page,
      label: bookmark.label || `Page ${bookmark.page}`,
      createdAt: Date.now(),
    },
    ...existing.filter((item) => item.page !== bookmark.page),
  ]
  map[bookId] = next
  writeAll(map)
  return next
}

export function removeBookmark(bookId, bookmarkId) {
  const map = readAll()
  map[bookId] = (map[bookId] || []).filter((item) => item.id !== bookmarkId)
  writeAll(map)
  return map[bookId]
}

export function clearBookmarks(bookId) {
  const map = readAll()
  delete map[bookId]
  writeAll(map)
}
