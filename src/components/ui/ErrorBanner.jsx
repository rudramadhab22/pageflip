import { AlertCircle, Info, X } from 'lucide-react'

const tones = {
  error: {
    wrap: 'border-danger/30 bg-danger/10',
    icon: 'text-danger',
    Icon: AlertCircle,
  },
  warning: {
    wrap: 'border-gilt/30 bg-gilt/10',
    icon: 'text-gilt-bright',
    Icon: Info,
  },
}

export function ErrorBanner({ message, onDismiss, tone = 'error' }) {
  if (!message) return null
  const style = tones[tone] || tones.error
  const Icon = style.Icon

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-ink-100 ${style.wrap}`}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${style.icon}`} aria-hidden />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-ink-300 transition hover:bg-white/5 hover:text-ink-100"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
