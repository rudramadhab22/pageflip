import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ACCEPTED_PDF_TYPES, LARGE_PDF_WARN_BYTES } from '../lib/constants'
import { createBookId, stripPdfExtension } from '../lib/format'
import { clearBookmarks } from '../services/bookmarks'
import { deletePdfBlob, savePdfBlob } from '../services/idb'
import { removeProgress } from '../services/readingProgress'
import {
  getRecentBooks,
  removeRecentBook,
  upsertRecentBook,
} from '../services/recentBooks'

const LibraryContext = createContext(null)

function isPdfFile(file) {
  if (!file) return false
  const byType = ACCEPTED_PDF_TYPES.includes(file.type)
  const byName = /\.pdf$/i.test(file.name || '')
  return byType || byName
}

export function LibraryProvider({ children }) {
  const [recentBooks, setRecentBooks] = useState(() => getRecentBooks())
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importWarning, setImportWarning] = useState(null)

  useEffect(() => {
    setRecentBooks(getRecentBooks())
  }, [])

  const refreshRecent = useCallback(() => {
    setRecentBooks(getRecentBooks())
  }, [])

  const importPdfFile = useCallback(async (file) => {
    setImportError(null)
    setImportWarning(null)

    if (!isPdfFile(file)) {
      const error = new Error('Please choose a PDF file.')
      setImportError(error.message)
      throw error
    }

    if (file.size > LARGE_PDF_WARN_BYTES) {
      setImportWarning(
        'This PDF is large. PageFlip will keep it on this device and render pages progressively.',
      )
    }

    setIsImporting(true)

    try {
      const id = createBookId()
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      let pageCount = null
      let metaTitle = ''
      try {
        const { probePdfMetadata } = await import('../lib/pdfMeta')
        const meta = await probePdfMetadata(bytes.slice(0))
        pageCount = meta.pageCount
        metaTitle = meta.title
      } catch {
        // Metadata probe is optional in Phase 1; reader will validate again.
      }

      const blob = new Blob([bytes], { type: 'application/pdf' })
      await savePdfBlob({
        id,
        blob,
        name: file.name,
        type: file.type || 'application/pdf',
      })

      const book = {
        id,
        name: file.name,
        title: metaTitle || stripPdfExtension(file.name),
        size: file.size,
        pageCount,
        addedAt: Date.now(),
        lastOpenedAt: Date.now(),
      }

      const next = upsertRecentBook(book)
      setRecentBooks(next)
      return book
    } catch (error) {
      const message = error?.message || 'Could not import this PDF.'
      setImportError(message)
      throw error
    } finally {
      setIsImporting(false)
    }
  }, [])

  const removeBook = useCallback(async (id) => {
    await deletePdfBlob(id)
    removeProgress(id)
    clearBookmarks(id)
    const next = removeRecentBook(id)
    setRecentBooks(next)
  }, [])

  const value = useMemo(
    () => ({
      recentBooks,
      isImporting,
      importError,
      importWarning,
      setImportError,
      setImportWarning,
      importPdfFile,
      removeBook,
      refreshRecent,
    }),
    [
      recentBooks,
      isImporting,
      importError,
      importWarning,
      importPdfFile,
      removeBook,
      refreshRecent,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) {
    throw new Error('useLibrary must be used within LibraryProvider')
  }
  return ctx
}
