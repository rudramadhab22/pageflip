export const APP_NAME = 'PageFlip'

export const STORAGE_KEYS = {
  recentBooks: 'pageflip:recent-books',
  readingProgress: 'pageflip:reading-progress',
  bookmarks: 'pageflip:bookmarks',
}

export const IDB = {
  name: 'pageflip-library',
  version: 1,
  store: 'pdfs',
}

export const MAX_RECENT_BOOKS = 24
export const ACCEPTED_PDF_TYPES = ['application/pdf']
export const ACCEPTED_EXTENSION = '.pdf'

/** Soft limit warning threshold (bytes). Files still open locally. */
export const LARGE_PDF_WARN_BYTES = 40 * 1024 * 1024

/** Above this page count, mount a sliding window instead of every page. */
export const FULL_MOUNT_PAGE_LIMIT = 80
export const PAGE_WINDOW_SIZE = 40

/** Near-edge threshold that shifts the sliding window. */
export const PAGE_WINDOW_SHIFT_MARGIN = 4

/** In-memory rendered page budget (LRU). Sharper PNGs are heavier — keep lean. */
export const PAGE_IMAGE_CACHE_LIMIT = 20

/** Concurrent PDF.js page renders. */
export const PAGE_RENDER_CONCURRENCY = 2

/** Warn in reader UI when a document is this large. */
export const LARGE_PAGE_COUNT_WARN = 120
