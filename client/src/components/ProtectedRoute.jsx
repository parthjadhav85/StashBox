import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader2, Bookmark } from 'lucide-react'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Stashbox</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
