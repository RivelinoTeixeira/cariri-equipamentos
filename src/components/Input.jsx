export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      {label && (
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-nexus-muted">
          {label}
        </div>
      )}
      {children}
      {hint && !error && (
        <div className="mt-1 text-[11px] text-nexus-muted">{hint}</div>
      )}
      {error && (
        <div className="mt-1 text-[11px] text-nexus-danger">{error}</div>
      )}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl bg-nexus-surface/80 border border-nexus-border text-nexus-text placeholder:text-nexus-muted/70 px-3.5 py-3 sm:py-2.5 text-base sm:text-sm outline-none transition focus:border-nexus-purple focus:ring-2 focus:ring-nexus-purple/30 ${
        props.className || ''
      }`}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl bg-nexus-surface/80 border border-nexus-border text-nexus-text px-3.5 py-3 sm:py-2.5 text-base sm:text-sm outline-none transition focus:border-nexus-purple focus:ring-2 focus:ring-nexus-purple/30 ${
        props.className || ''
      }`}
    >
      {children}
    </select>
  )
}
