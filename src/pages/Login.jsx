import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import Logo from '../assets/logo'
import Button from '../components/Button'
import { Field, Input } from '../components/Input'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signIn, signUp, backendMode } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Falha na autenticacao.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setEmail('admin@nexusjr.com')
    setPassword('nexus123')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-nexus-bg text-nexus-text">
      {/* halos de fundo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-nexus-purple/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-nexus-cyan/20 blur-3xl" />

      {/* toggle de tema flutuante */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo size={56} />
          </div>

          <div className="rounded-3xl border border-nexus-border bg-nexus-card/70 backdrop-blur-2xl shadow-glow p-6 sm:p-8 animate-slide-up">
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {mode === 'signin' ? 'Acessar painel' : 'Criar conta'}
              </h1>
              <p className="text-sm text-nexus-muted mt-1">
                Dashboard interno NexusJR Stream
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="E-mail">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field label="Senha">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
              </Field>

              {error && (
                <div className="rounded-xl border border-nexus-danger/40 bg-nexus-danger/10 text-nexus-danger text-sm px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {mode === 'signin' ? 'Entrar' : 'Cadastrar'}
              </Button>
            </form>

            <div className="mt-5 flex flex-col gap-2 text-center text-sm">
              <button
                onClick={() => {
                  setError(null)
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                }}
                className="text-nexus-cyan hover:underline"
              >
                {mode === 'signin'
                  ? 'Nao tem conta? Cadastre-se'
                  : 'Ja tenho conta. Entrar'}
              </button>

              {backendMode === 'local' && (
                <button
                  onClick={fillDemo}
                  type="button"
                  className="text-xs text-nexus-muted hover:text-nexus-text"
                >
                  Usar credenciais de demonstracao
                </button>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.18em] text-nexus-muted">
            {backendMode === 'supabase'
              ? 'Conectado ao Supabase'
              : 'Modo Local (preview) - configure .env para usar Supabase'}
          </p>
        </div>
      </div>
    </div>
  )
}
