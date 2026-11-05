import { Clock3, FileText, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { coverPaletteFromId, formatBytes, formatRelativeTime } from '../../lib/format'
import { getProgress } from '../../services/readingProgress'

export function BookCard({ book, onRemove }) {
  const palette = coverPaletteFromId(book.id)
  const progress = getProgress(book.id)
  const percent = Math.min(100, Math.max(0, progress?.percent || 0))

  return (
    <article className="group relative">
      <Link
        to={`/reader/${book.id}`}
        className="block rounded-2xl outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-gilt/60"
      >
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/8 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-gilt/30"
          style={{
            background: `linear-gradient(155deg, ${palette.from}, ${palette.to})`,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-3"
            style={{ background: palette.spine }}
          />
          <div
            aria-hidden
            className="absolute inset-y-3 right-0 w-2 rounded-l-sm bg-paper/90 shadow-[-6px_0_12px_rgba(0,0,0,0.35)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%,rgba(0,0,0,0.35))]" />

          <div className="absolute inset-x-5 bottom-5 top-8 flex flex-col justify-between pl-2">
            <div>
              <p className="font-display text-xl leading-snug text-paper text-balance">
                {book.title || book.name}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-paper/70">
                <FileText className="size-3.5" />
                {book.pageCount ? `${book.pageCount} pages` : 'PDF'}
              </p>
            </div>

            <div>
              <div className="h-1 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-gilt"
                  style={{ width: `${percent || 2}%` }}
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] tracking-wide text-paper/65 uppercase">
                <Clock3 className="size-3" />
                {formatRelativeTime(book.lastOpenedAt)}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink-100">{book.title || book.name}</p>
          <p className="mt-0.5 text-xs text-ink-500">{formatBytes(book.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(book.id)}
          className="rounded-lg p-2 text-ink-500 transition hover:bg-white/5 hover:text-danger"
          aria-label={`Remove ${book.title || book.name}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  )
}
