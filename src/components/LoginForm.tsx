'use client'

import { useState, useEffect } from 'react'

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
  
  const fullText = 'Faça login para acessar sua conta'
  
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
    
    setTimeout(() => {
      setIsLoading(false)
      
      // Verificar se é administrador
      if (email === 'admin@admin.com' && password === 'admin123') {
        window.location.href = '/dashboard'
      } 
      // Verificar se é administrador com senha incorreta
      else if (email === 'admin@admin.com' && password !== 'admin123') {
        setLoginError('Senha incorreta para conta de administrador')
      }
      // Qualquer outro email válido é considerado estudante
      else if (email.includes('@') && email.includes('.')) {
        window.location.href = '/student-dashboard'
      }
      // Email inválido
      else {
        setLoginError('Email inválido')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#654321] via-[#8B4513] via-[#A0522D] to-[#8B4513] flex items-center justify-center p-4 xs:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#FFD700]/5 to-transparent"></div>
      
      {/* Enhanced Floating Particles with Parallax */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-[#FFD700] rounded-full enhanced-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-[#FFA500] rounded-full parallax-element opacity-40"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-[#FFD700] rounded-full enhanced-float opacity-30"></div>
      <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-[#B8860B] rounded-full parallax-element opacity-50"></div>
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#FFD700] rounded-full enhanced-float opacity-35"></div>
      <div className="absolute top-32 right-1/3 w-1 h-1 bg-[#FFA500] rounded-full parallax-element opacity-45"></div>
      
      {/* Morphing Shapes */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 morphing-shape opacity-30"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-tr from-[#B8860B]/15 to-[#FFD700]/20 morphing-shape opacity-25" style={{animationDelay: '5s'}}></div>
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-r from-[#FFA500]/20 to-[#FFD700]/15 morphing-shape opacity-20" style={{animationDelay: '10s'}}></div>
      
      <div className={`glass-card rounded-2xl xs:rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-[#FFD700] p-6 xs:p-8 md:p-8 w-full max-w-xs xs:max-w-sm md:max-w-md relative z-10 hover:shadow-[0_35px_60px_-12px_rgba(255,215,0,0.2)] hover:border-[#FFA500] transition-all duration-500 before:absolute before:inset-0 before:rounded-2xl xs:before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-[#FFD700] before:via-[#FFA500] before:to-[#FFD700] before:-z-10 before:opacity-50 ${showCard ? 'animate-slide-in-up' : 'opacity-0'}`}>
        <div className="text-center mb-6 xs:mb-8">
          <div className="flex items-center justify-center mb-4 xs:mb-6 animate-fade-in-scale">
            <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg xs:rounded-xl flex items-center justify-center mr-2 xs:mr-3 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-pulse-gold">
              <span className="text-[#3D2914] font-bold text-lg xs:text-xl font-montserrat">S</span>
            </div>
            <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-[#3D2914] font-montserrat">SwiftEDU</h1>
          </div>
          <p className="text-[#3D2914] font-medium text-sm xs:text-base min-h-[1.5rem]">
            {typedText}<span className="animate-pulse">|</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 md:space-y-6">
          <div className="group animate-slide-in-left">
            <label htmlFor="email" className="block text-xs xs:text-sm font-semibold text-[#2C1A0E] mb-2 xs:mb-3 transition-colors duration-200 group-focus-within:text-[#B8860B]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              className="w-full px-3 xs:px-4 py-3 xs:py-4 border-2 border-[#D2B48C] rounded-lg xs:rounded-xl focus:ring-2 xs:focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700] focus:shadow-lg focus:shadow-[#FFD700]/20 transition-all duration-300 bg-white/90 hover:bg-white hover:border-[#FFD700]/50 hover:shadow-md font-medium text-sm xs:text-base"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="group animate-slide-in-right">
            <label htmlFor="password" className="block text-xs xs:text-sm font-semibold text-[#2C1A0E] mb-2 xs:mb-3 transition-colors duration-200 group-focus-within:text-[#B8860B]">
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
                className="w-full px-3 xs:px-4 py-3 xs:py-4 pr-12 border-2 border-[#D2B48C] rounded-lg xs:rounded-xl focus:ring-2 xs:focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700] focus:shadow-lg focus:shadow-[#FFD700]/20 transition-all duration-300 bg-white/90 hover:bg-white hover:border-[#FFD700]/50 hover:shadow-md font-medium text-sm xs:text-base"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D2914] hover:text-[#B8860B] transition-colors duration-200"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Caps Lock Warning */}
            {capsLockOn && (
              <div className="mt-2 flex items-center text-orange-600 text-xs">
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
                            ? 'bg-red-500'
                            : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#3D2914] font-medium">
                  Força: {passwordStrength <= 2 ? 'Fraca' : passwordStrength <= 3 ? 'Média' : 'Forte'}
                </p>
              </div>
            )}
          </div>

          {/* Login Error Message */}
          {loginError && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <p className="text-red-700 font-medium text-sm">{loginError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] disabled:bg-[#D2B48C] text-white font-semibold py-3 xs:py-4 px-4 rounded-lg xs:rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-[0_15px_30px_-5px_rgba(255,215,0,0.3)] disabled:transform-none disabled:shadow-none border-2 border-transparent hover:border-[#FFD700] active:scale-[0.98] font-montserrat relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 text-sm xs:text-base animate-fade-in-scale"
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
          <p className="text-xs xs:text-sm text-[#3D2914] font-medium">
            Não possui uma conta? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  )
}