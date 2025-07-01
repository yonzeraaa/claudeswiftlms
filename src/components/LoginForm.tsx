'use client'

import { useState, useEffect } from 'react'
import { signInWithEmail, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()

  useEffect(() => {
    setShowCard(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setIsLoading(true)
    setLoginError('')
    
    try {
      // Authenticate with Supabase
      await signInWithEmail(email, password)
      
      // Get user profile to determine role
      const user = await getCurrentUser()
      
      if (user) {
        // Redirect based on user role
        if (user.profile.role === 'admin') {
          router.push('/dashboard')
        } else if (user.profile.role === 'instructor') {
          router.push('/teacher-dashboard')
        } else {
          router.push('/student-dashboard')
        }
      } else {
        setLoginError('Erro ao carregar perfil do usuário')
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      setLoginError(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a202c] via-[#2d3748] to-[#1a202c] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-10"></div>
      
      <div className={`bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-600/50 p-8 w-full max-w-md relative z-10 shadow-2xl ${showCard ? 'animate-slide-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#fbbf24] font-montserrat mb-2">
            Bem-vindo ao
          </h1>
          <h2 className="text-4xl font-bold text-[#fbbf24] font-montserrat mb-6">
            SwiftLMS
          </h2>
          <p className="text-gray-300 text-sm">
            Faça login para acessar seu painel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-[#fbbf24] transition-all duration-300 text-white placeholder-gray-400"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
              Senha:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-[#fbbf24] transition-all duration-300 text-white placeholder-gray-400"
              placeholder="Sua senha"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-[#fbbf24] bg-gray-700 border-gray-600 rounded focus:ring-[#fbbf24]" />
              <span className="ml-2 text-gray-300 text-sm">Lembrar-me</span>
            </label>
            <a href="#" className="text-[#fbbf24] hover:text-[#fcd34d] text-sm transition-colors">
              Esqueceu a sua senha?
            </a>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] disabled:bg-gray-600 text-gray-900 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Se você ainda não possui credenciais cadastradas,
          </p>
          <p className="text-gray-400 text-sm">
            favor entrar em contato com um administrador.
          </p>
        </div>
      </div>
    </div>
  )
}