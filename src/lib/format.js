export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return '—'
  const delta = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (delta < minute) return 'Just now'
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`
  if (delta < day) return `${Math.floor(delta / hour)}h ago`
  if (delta < 7 * day) return `${Math.floor(delta / day)}d ago`

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp))
}

export function stripPdfExtension(name = '') {
  return name.replace(/\.pdf$/i, '').trim() || 'Untitled book'
}

export function createBookId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `book_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/** Deterministic leather-like cover tones from a string. */
export function coverPaletteFromId(id = '') {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const palettes = [
    { from: '#3a2418', to: '#8b5a3c', spine: '#24150f' },
    { from: '#1c2a38', to: '#3f5f7a', spine: '#101820' },
    { from: '#2a1c28', to: '#6e4458', spine: '#160f14' },
    { from: '#1e2a22', to: '#4d6b55', spine: '#101712' },
    { from: '#2c2414', to: '#7a6540', spine: '#17130a' },
  ]
  return palettes[Math.abs(hash) % palettes.length]
}
