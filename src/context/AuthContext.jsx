import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, backendMode } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    authApi.getSession().then((session) => {
      if (!mounted) return
      setUser(session?.user || null)
      setLoading(false)
    })
    const unsub = authApi.onAuthStateChange((session) => {
      setUser(session?.user || null)
    })
    return () => {
      mounted = false
      unsub && unsub()
    }
  }, [])

  async function signIn(email, password) {
    const data = await authApi.signIn({ email, password })
    setUser(data?.user || data?.session?.user || null)
    return data
  }

  async function signUp(email, password) {
    const data = await authApi.signUp({ email, password })
    setUser(data?.user || data?.session?.user || null)
    return data
  }

  async function signOut() {
    await authApi.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, backendMode }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
