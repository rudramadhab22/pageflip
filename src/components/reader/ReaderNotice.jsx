import { Info } from 'lucide-react'

export function ReaderNotice({ children }) {
  if (!children) return null

  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border border-gilt/25 bg-gilt/10 px-4 py-3 text-sm text-ink-100">
      <Info className="mt-0.5 size-4 shrink-0 text-gilt-bright" aria-hidden />
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}
