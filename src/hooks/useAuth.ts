import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthUser, getCurrentUser } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error('Error getting user after sign in:', error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        // Don't set loading to false here for INITIAL_SESSION
        if (event !== 'INITIAL_SESSION') {
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.profile.role === 'admin',
    isStudent: user?.profile.role === 'student',
  }
}