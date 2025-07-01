'use client'

import { useState, useEffect } from 'react'
import { signInWithEmail, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [showCard, setShowCard] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()
  
  const fullText = '"O que sabemos é uma gota. O que não, um oceano."'
  
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength += 1
    if (pwd.length >= 10) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  useEffect(() => {
    setShowCard(true)
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 80)
    
    return () => clearInterval(timer)
  }, [fullText])

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
    <div className="min-h-screen bg-gradient-to-br from-[#0B1426] via-[#1e3a8a] via-[#1f2937] to-[#0B1426] flex items-center justify-center p-4 xs:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#0ea5e9]/10 to-transparent"></div>
      
      {/* Naval Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-[#0ea5e9] rounded-full enhanced-float opacity-70"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-[#38bdf8] rounded-full parallax-element opacity-50"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-[#fbbf24] rounded-full enhanced-float opacity-60"></div>
      <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-[#0ea5e9] rounded-full parallax-element opacity-40"></div>
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#38bdf8] rounded-full enhanced-float opacity-55"></div>
      <div className="absolute top-32 right-1/3 w-1 h-1 bg-[#fbbf24] rounded-full parallax-element opacity-65"></div>
      
      {/* Naval Wave Shapes */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-[#0ea5e9]/15 to-[#38bdf8]/10 morphing-shape opacity-40"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-tr from-[#1e40af]/20 to-[#0ea5e9]/15 morphing-shape opacity-35" style={{animationDelay: '5s'}}></div>
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-r from-[#38bdf8]/20 to-[#0ea5e9]/15 morphing-shape opacity-30" style={{animationDelay: '10s'}}></div>
      
      <div className={`rounded-2xl xs:rounded-3xl shadow-[0_25px_50px_-12px_rgba(139,69,19,0.4)] border-2 border-[#B8860B] p-6 xs:p-8 md:p-10 lg:p-12 xl:p-14 w-full max-w-xs xs:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative z-10 hover:shadow-[0_35px_60px_-12px_rgba(184,134,11,0.5)] hover:border-[#DAA520] transition-all duration-500 before:absolute before:inset-0 before:rounded-2xl xs:before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-[#B8860B] before:via-[#8B4513] before:to-[#B8860B] before:-z-10 before:opacity-60 bg-gradient-to-br from-[#2C1810]/95 via-[#4A2C17]/95 to-[#654321]/95 backdrop-blur-xl ${showCard ? 'animate-slide-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-6 xs:mb-8 lg:mb-10 xl:mb-12">
          <div className="flex items-center justify-center mb-4 xs:mb-6 lg:mb-8 animate-fade-in-scale">
            <div className="w-10 h-10 xs:w-12 xs:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 lg:mr-4 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-pulse-gold border border-[#B8860B]/30">
              <span className="text-[#2C1810] font-bold text-lg xs:text-xl lg:text-2xl xl:text-3xl font-montserrat">S</span>
            </div>
            <h1 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FFD700] font-montserrat">SwiftEDU</h1>
          </div>
          <p className="text-[#B8860B] font-medium text-sm xs:text-base lg:text-lg xl:text-xl min-h-[1.5rem]">
            {typedText}<span className="animate-pulse">|</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
          <div className="group animate-slide-in-left">
            <label htmlFor="email" className="block text-xs xs:text-sm font-semibold text-[#FFD700] mb-2 xs:mb-3 transition-colors duration-200 group-focus-within:text-[#DAA520]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              className="w-full px-3 xs:px-4 py-3 xs:py-4 border-2 border-[#475569] rounded-lg xs:rounded-xl focus:ring-2 xs:focus:ring-4 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] focus:shadow-lg focus:shadow-[#0ea5e9]/20 transition-all duration-300 bg-white/95 hover:bg-white hover:border-[#38bdf8]/50 hover:shadow-md font-medium text-sm xs:text-base text-[#1e40af]"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="group animate-slide-in-right">
            <label htmlFor="password" className="block text-xs xs:text-sm font-semibold text-[#FFD700] mb-2 xs:mb-3 transition-colors duration-200 group-focus-within:text-[#DAA520]">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                className="w-full px-3 xs:px-4 py-3 xs:py-4 pr-12 border-2 border-[#475569] rounded-lg xs:rounded-xl focus:ring-2 xs:focus:ring-4 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] focus:shadow-lg focus:shadow-[#0ea5e9]/20 transition-all duration-300 bg-white/95 hover:bg-white hover:border-[#38bdf8]/50 hover:shadow-md font-medium text-sm xs:text-base text-[#1e40af]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0ea5e9] transition-colors duration-200"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Caps Lock Warning */}
            {capsLockOn && (
              <div className="mt-2 flex items-center text-amber-400 text-xs">
                <span className="mr-1">⚠️</span>
                Caps Lock está ativado
              </div>
            )}
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        passwordStrength >= level
                          ? passwordStrength <= 2
                            ? 'bg-red-400'
                            : passwordStrength <= 3
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                          : 'bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#e2e8f0] font-medium">
                  Força: {passwordStrength <= 2 ? 'Fraca' : passwordStrength <= 3 ? 'Média' : 'Forte'}
                </p>
              </div>
            )}
          </div>

          {/* Login Error Message */}
          {loginError && (
            <div className="p-3 bg-red-500/10 border-2 border-red-400/30 rounded-lg backdrop-blur-sm">
              <div className="flex items-center">
                <span className="text-red-400 mr-2">⚠️</span>
                <p className="text-red-300 font-medium text-sm">{loginError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-[#8B4513] to-[#B8860B] hover:from-[#A0522D] hover:to-[#DAA520] disabled:bg-[#64748b] text-white font-semibold py-3 xs:py-4 px-4 rounded-lg xs:rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-[0_15px_30px_-5px_rgba(184,134,11,0.4)] disabled:transform-none disabled:shadow-none border-2 border-transparent hover:border-[#FFD700] active:scale-[0.98] font-montserrat relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 text-sm xs:text-base animate-fade-in-scale"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 xs:mt-8 text-center animate-fade-in-scale">
          <p className="text-xs xs:text-sm text-[#B8860B] font-medium">
            Não possui uma conta? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  )
}