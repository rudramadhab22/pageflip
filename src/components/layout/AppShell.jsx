import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../lib/constants'

/**
 * Keep a stable DOM tree so reader expand mode never remounts children.
 */
export function AppShell({ children, dense = false, hideChrome = false, fullBleed = false }) {
  return (
    <div className="bg-room min-h-dvh text-ink-100">
      <header
        className={`relative z-[80] mx-auto flex w-full items-center justify-between px-5 sm:px-8 ${
          dense ? 'py-4' : 'py-6'
        } ${fullBleed ? 'max-w-none' : 'max-w-6xl'} ${
          hideChrome ? 'pointer-events-none absolute -top-[999px] h-0 overflow-hidden opacity-0' : ''
        }`}
        aria-hidden={hideChrome || undefined}
      >
        <Link
          to="/"
          tabIndex={hideChrome ? -1 : undefined}
          className="group relative z-[81] inline-flex items-center gap-2.5 text-ink-100 transition hover:text-gilt-bright"
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

      <main
        className={`relative z-10 mx-auto w-full ${
          hideChrome ? 'max-w-none px-0 pb-0' : `px-5 pb-16 sm:px-8 ${fullBleed ? 'max-w-none' : 'max-w-6xl'}`
        }`}
      >
        {children}
      </main>
    </div>
  )
}
