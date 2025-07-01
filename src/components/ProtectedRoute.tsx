'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'student'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && user?.profile.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        const userRedirect = user?.profile.role === 'admin' ? '/dashboard' : '/student-dashboard'
        router.push(userRedirect)
        return
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#334155] flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#654321]"></div>
            <span className="text-[#1e293b] font-semibold">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.profile.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}