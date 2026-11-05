import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../lib/constants'

export function AppShell({ children, dense = false }) {
  return (
    <div className="bg-room min-h-dvh text-ink-100">
      <header className={`mx-auto flex w-full max-w-6xl items-center justify-between px-5 ${dense ? 'py-4' : 'py-6'} sm:px-8`}>
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-ink-100 transition hover:text-gilt-bright"
        >
          <span className="grid size-9 place-items-center rounded-xl border border-gilt/25 bg-ink-850 text-gilt shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <BookOpen className="size-4" strokeWidth={1.75} />
          </span>
          <span className="font-display text-2xl tracking-tight">{APP_NAME}</span>
        </Link>
        <p className="hidden text-xs tracking-[0.18em] text-ink-500 uppercase sm:block">
          Local · Private · Realistic
        </p>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">{children}</main>
    </div>
  )
}
