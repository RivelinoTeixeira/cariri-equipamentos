import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-nexus-bg">
        <div className="flex items-center gap-3 text-nexus-muted">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-nexus-purple/40 border-t-nexus-purple" />
          Carregando sessao...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
