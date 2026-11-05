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
