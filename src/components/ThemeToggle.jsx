import { useTheme } from '../context/ThemeContext'

const SunIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
)

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      className={`relative inline-flex items-center gap-2 rounded-xl border border-nexus-border bg-nexus-card/70 backdrop-blur-md px-3 py-2 text-sm hover:border-nexus-purple/50 transition ${className}`}
    >
      <span
        className={`grid place-items-center h-6 w-6 rounded-lg ${
          isDark
            ? 'bg-nexus-purple/15 text-nexus-purple'
            : 'bg-nexus-cyan/15 text-nexus-cyan-neon'
        }`}
      >
        {isDark ? MoonIcon : SunIcon}
      </span>
      <span className="hidden sm:inline text-nexus-muted">
        {isDark ? 'Escuro' : 'Claro'}
      </span>
    </button>
  )
}
