const variants = {
  primary:
    'bg-gilt text-ink-950 hover:bg-gilt-bright shadow-[0_10px_30px_-12px_rgba(201,166,107,0.65)]',
  secondary:
    'bg-ink-800 text-ink-100 border border-white/8 hover:bg-ink-700 hover:border-white/12',
  ghost: 'bg-transparent text-ink-300 hover:bg-white/5 hover:text-ink-100',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
  icon: 'size-10 p-0',
}

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gilt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
