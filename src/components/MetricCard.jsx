import { formatBRL } from '../utils/format'

export default function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = 'default'
}) {
  const tones = {
    default: 'text-nexus-text',
    success: 'text-nexus-success',
    danger: 'text-nexus-danger',
    purple: 'text-nexus-purple',
    cyan: 'text-nexus-cyan'
  }

  const glow = {
    default: 'from-white/10 to-white/0',
    success: 'from-nexus-success/30 to-nexus-success/0',
    danger: 'from-nexus-danger/30 to-nexus-danger/0',
    purple: 'from-nexus-purple/30 to-nexus-purple/0',
    cyan: 'from-nexus-cyan/30 to-nexus-cyan/0'
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-nexus-border bg-nexus-card/80 backdrop-blur-md p-4 sm:p-5 animate-slide-up">
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-70 bg-gradient-to-br ${glow[tone]}`}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-nexus-muted font-semibold leading-tight">
          {label}
        </div>
        {icon && (
          <div className="shrink-0 rounded-lg bg-nexus-surface border border-nexus-border p-1.5 text-nexus-text">
            {icon}
          </div>
        )}
      </div>
      <div className={`relative mt-2 sm:mt-3 text-xl sm:text-3xl font-extrabold tracking-tight break-words ${tones[tone]}`}>
        {typeof value === 'number' ? formatBRL(value) : value}
      </div>
      {hint && (
        <div className="relative mt-1 text-[11px] sm:text-xs text-nexus-muted leading-snug">
          {hint}
        </div>
      )}
    </div>
  )
}
