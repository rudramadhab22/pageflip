export function Spinner({ className = '', label = 'Loading' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block size-5 animate-spin rounded-full border-2 border-gilt/30 border-t-gilt ${className}`}
    />
  )
}
