import { Library } from 'lucide-react'
import { BookCard } from './BookCard'

export function RecentBooks({ books, onRemove }) {
  if (!books.length) {
    return (
      <section className="mt-14">
        <div className="mb-5 flex items-center gap-2 text-ink-300">
          <Library className="size-4 text-gilt" />
          <h2 className="text-sm tracking-[0.18em] uppercase">Recently opened</h2>
        </div>
        <div className="rounded-2xl border border-white/8 bg-ink-850/50 px-6 py-10 text-center">
          <p className="font-display text-2xl text-ink-100">Your shelf is empty</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Open a PDF to start a private library on this device. Reading progress and bookmarks
            will appear here next.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-ink-300">
            <Library className="size-4 text-gilt" />
            <h2 className="text-sm tracking-[0.18em] uppercase">Recently opened</h2>
          </div>
          <p className="text-sm text-ink-500">Stored locally in this browser only.</p>
        </div>
        <p className="text-xs text-ink-500">{books.length} book{books.length === 1 ? '' : 's'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onRemove={onRemove} />
        ))}
      </div>
    </section>
  )
}
