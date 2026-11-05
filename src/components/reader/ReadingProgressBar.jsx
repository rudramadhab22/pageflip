export function ReadingProgressBar({ percent, label }) {
  const value = Math.min(100, Math.max(0, percent || 0))

  return (
    <div className="w-full" aria-label="Reading progress">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] tracking-wide text-ink-500 uppercase">
        <span>Progress</span>
        <span>{label || `${value}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-leather to-gilt transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
