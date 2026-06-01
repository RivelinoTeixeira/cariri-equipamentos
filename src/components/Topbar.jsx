import { useState } from 'react'
import Logo from '../assets/logo'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  const { user, signOut, backendMode } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 bg-nexus-bg/80 backdrop-blur-xl border-b border-nexus-border"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <Logo size={32} />

        <div className="hidden md:flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${
              backendMode === 'supabase'
                ? 'text-nexus-success border-nexus-success/40 bg-nexus-success/10'
                : 'text-nexus-cyan border-nexus-cyan/40 bg-nexus-cyan/10'
            }`}
          >
            {backendMode === 'supabase' ? 'Supabase ON' : 'Modo Local'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-nexus-border bg-nexus-card/70 backdrop-blur-md px-2.5 sm:px-3 py-2 text-sm hover:border-nexus-purple/50 transition"
            aria-label="Menu da conta"
          >
            <span className="h-7 w-7 rounded-full bg-grad-nexus grid place-items-center text-xs font-extrabold text-white">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </span>
            <span className="hidden md:inline text-nexus-muted truncate max-w-[160px]">
              {user?.email || 'admin'}
            </span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-nexus-border bg-nexus-card/95 backdrop-blur-xl shadow-glow z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-nexus-border">
                  <div className="text-[10px] uppercase tracking-wider text-nexus-muted">
                    Logado como
                  </div>
                  <div className="text-sm font-semibold truncate">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false)
                    signOut()
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-nexus-danger hover:bg-nexus-danger/10"
                >
                  Sair da conta
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
