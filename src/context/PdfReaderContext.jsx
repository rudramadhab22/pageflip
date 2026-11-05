import { createContext, useContext, useMemo } from 'react'

const PdfReaderContext = createContext(null)

export function PdfReaderProvider({
  pdf,
  pageCount,
  cssWidth,
  flipIndex,
  absolutePage,
  title,
  bookId,
  renderProfile,
  children,
}) {
  const value = useMemo(
    () => ({
      pdf,
      pageCount,
      cssWidth,
      flipIndex,
      absolutePage,
      title,
      bookId,
      renderProfile,
    }),
    [pdf, pageCount, cssWidth, flipIndex, absolutePage, title, bookId, renderProfile],
  )

  return <PdfReaderContext.Provider value={value}>{children}</PdfReaderContext.Provider>
}

export function usePdfReader() {
  const ctx = useContext(PdfReaderContext)
  if (!ctx) {
    throw new Error('usePdfReader must be used within PdfReaderProvider')
  }
  return ctx
}
