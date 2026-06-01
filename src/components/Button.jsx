export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  icon = null,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nexus-bg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3'
  }

  const variants = {
    primary:
      'bg-grad-nexus text-white shadow-glow hover:shadow-glow-cyan focus:ring-nexus-purple',
    secondary:
      'bg-nexus-card border border-nexus-border text-nexus-text hover:border-nexus-purple/60 hover:bg-nexus-surface focus:ring-nexus-purple/60',
    ghost:
      'bg-transparent text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface focus:ring-nexus-purple/30',
    danger:
      'bg-nexus-danger/10 text-nexus-danger border border-nexus-danger/40 hover:bg-nexus-danger/20 focus:ring-nexus-danger'
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  )
}
