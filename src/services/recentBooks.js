import { MAX_RECENT_BOOKS, STORAGE_KEYS } from '../lib/constants'

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentBooks)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(books) {
  localStorage.setItem(STORAGE_KEYS.recentBooks, JSON.stringify(books))
}

export function getRecentBooks() {
  return readRaw().sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
}

export function upsertRecentBook(book) {
  const without = readRaw().filter((item) => item.id !== book.id)
  const next = [
    {
      ...book,
      lastOpenedAt: book.lastOpenedAt || Date.now(),
    },
    ...without,
  ].slice(0, MAX_RECENT_BOOKS)

  writeRaw(next)
  return next
}

export function touchRecentBook(id) {
  const books = readRaw()
  const target = books.find((book) => book.id === id)
  if (!target) return getRecentBooks()
  return upsertRecentBook({ ...target, lastOpenedAt: Date.now() })
}

export function removeRecentBook(id) {
  const next = readRaw().filter((book) => book.id !== id)
  writeRaw(next)
  return next
}

export function clearRecentBooks() {
  writeRaw([])
  return []
}
