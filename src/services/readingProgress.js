import { STORAGE_KEYS } from '../lib/constants'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readingProgress)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  localStorage.setItem(STORAGE_KEYS.readingProgress, JSON.stringify(map))
}

export function getProgress(bookId) {
  return readAll()[bookId] || null
}

export function setProgress(bookId, progress) {
  const map = readAll()
  map[bookId] = {
    currentPage: progress.currentPage ?? 1,
    pageCount: progress.pageCount ?? null,
    percent: progress.percent ?? 0,
    updatedAt: Date.now(),
  }
  writeAll(map)
  return map[bookId]
}

export function removeProgress(bookId) {
  const map = readAll()
  delete map[bookId]
  writeAll(map)
}
