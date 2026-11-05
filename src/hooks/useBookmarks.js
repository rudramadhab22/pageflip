import { useCallback, useEffect, useState } from 'react'
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from '../services/bookmarks'

export function useBookmarks(bookId) {
  const [bookmarks, setBookmarks] = useState(() => (bookId ? getBookmarks(bookId) : []))

  useEffect(() => {
    setBookmarks(bookId ? getBookmarks(bookId) : [])
  }, [bookId])

  const toggleBookmark = useCallback(
    (page, label) => {
      if (!bookId || !page) return
      const existing = getBookmarks(bookId).find((item) => item.page === page)
      if (existing) {
        setBookmarks(removeBookmark(bookId, existing.id))
        return
      }
      setBookmarks(addBookmark(bookId, { page, label: label || `Page ${page}` }))
    },
    [bookId],
  )

  const remove = useCallback(
    (bookmarkId) => {
      if (!bookId) return
      setBookmarks(removeBookmark(bookId, bookmarkId))
    },
    [bookId],
  )

  const isBookmarked = useCallback(
    (page) => bookmarks.some((item) => item.page === page),
    [bookmarks],
  )

  return { bookmarks, toggleBookmark, remove, isBookmarked }
}
