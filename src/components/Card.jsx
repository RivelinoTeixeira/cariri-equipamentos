export default function Card({
  title,
  subtitle,
  icon = null,
  accent = 'purple',
  children,
  className = '',
  footer = null
}) {
  const accents = {
    purple: 'from-nexus-purple/30 to-nexus-purple/0',
    cyan: 'from-nexus-cyan/30 to-nexus-cyan/0',
    success: 'from-nexus-success/30 to-nexus-success/0',
    danger: 'from-nexus-danger/30 to-nexus-danger/0',
    neutral: 'from-white/10 to-white/0'
  }

  return (
    <div
      className={`relative rounded-2xl border border-nexus-border bg-nexus-card/80 backdrop-blur-md p-4 sm:p-5 overflow-hidden animate-slide-up ${className}`}
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${accents[accent]} blur-3xl opacity-60`}
      />
      {(title || icon) && (
        <div className="relative flex items-start justify-between mb-3">
          <div>
            {subtitle && (
              <div className="text-[11px] uppercase tracking-[0.18em] text-nexus-muted font-medium">
                {subtitle}
              </div>
            )}
            {title && (
              <h3 className="text-lg font-bold text-nexus-text mt-1">{title}</h3>
            )}
          </div>
          {icon && (
            <div className="rounded-xl bg-nexus-surface border border-nexus-border p-2 text-nexus-text">
              {icon}
            </div>
          )}
        </div>
      )}
      <div className="relative">{children}</div>
      {footer && (
        <div className="relative mt-4 pt-3 border-t border-nexus-border text-xs text-nexus-muted">
          {footer}
        </div>
      )}
    </div>
  )
}
