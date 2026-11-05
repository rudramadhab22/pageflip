import { ArrowLeft, BookMarked, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function ReaderPlaceholder({ book, pageCount }) {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-2xl border border-gilt/25 bg-ink-850 text-gilt">
        <Layers3 className="size-7" />
      </div>

      <p className="text-xs tracking-[0.22em] text-gilt uppercase">Phase 1 complete</p>
      <h1 className="mt-3 font-display text-4xl text-ink-100 text-balance sm:text-5xl">
        {book?.title || book?.name || 'Your book is ready'}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-300 sm:text-base">
        The PDF is stored on this device
        {pageCount ? ` · ${pageCount} pages detected` : ''}. Phase 2 builds the realistic 3D
        hardcover reader with page-flip animations and progressive PDF rendering.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to="/" variant="secondary">
          <ArrowLeft className="size-4" />
          Back to library
        </Button>
        <Button type="button" disabled title="Arrives in Phase 3">
          <BookMarked className="size-4" />
          Controls coming next
        </Button>
      </div>
    </div>
  )
}
