import { Bookmark, Trash2, X } from 'lucide-react'
import { Button } from '../ui/Button'

export function BookmarksPanel({ open, bookmarks, onClose, onGoTo, onRemove }) {
  if (!open) return null

  return (
    <aside
      className="absolute inset-y-3 right-3 z-30 flex w-[min(100%,20rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur-md"
      aria-label="Bookmarks"
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-2 text-ink-100">
          <Bookmark className="size-4 text-gilt" />
          <h2 className="text-sm font-medium">Bookmarks</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-500 transition hover:bg-white/5 hover:text-ink-100"
          aria-label="Close bookmarks"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!bookmarks.length ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
            <p className="font-display text-xl text-ink-100">No bookmarks yet</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Mark the current page to jump back here later. Saved only on this device.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink-850/80 p-2"
              >
                <button
                  type="button"
                  onClick={() => onGoTo(bookmark.page)}
                  className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/5"
                >
                  <p className="truncate text-sm text-ink-100">{bookmark.label}</p>
                  <p className="text-[11px] text-ink-500">Page {bookmark.page}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(bookmark.id)}
                  className="rounded-lg p-2 text-ink-500 transition hover:bg-white/5 hover:text-danger"
                  aria-label={`Remove bookmark on page ${bookmark.page}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/8 p-3">
        <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </aside>
  )
}
