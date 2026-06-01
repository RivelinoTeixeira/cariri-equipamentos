export default function Logo({ size = 40, withText = true }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
      >
        <defs>
          <linearGradient id="nexus-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#0B0B0C" stroke="url(#nexus-grad)" strokeWidth="1.5" />
        <path
          d="M16 46 V18 L34 38 V18 H48 V46 H40 L22 26 V46 Z"
          fill="url(#nexus-grad)"
        />
      </svg>
      {withText && (
        <div className="leading-tight">
          <div className="text-base sm:text-lg font-extrabold tracking-tight">
            <span className="text-nexus-text">Nexus</span>
            <span className="bg-grad-nexus bg-clip-text text-transparent">JR</span>
          </div>
          <div className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-nexus-muted">
            Stream Dashboard
          </div>
        </div>
      )}
    </div>
  )
}
