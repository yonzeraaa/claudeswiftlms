'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TeacherDashboardContent from './TeacherDashboardContent'
import TeacherClassesContent from './TeacherClassesContent'
import TeacherGradingContent from './TeacherGradingContent'
import TeacherStudentsContent from './TeacherStudentsContent'

type Section = 'dashboard' | 'classes' | 'students' | 'grading' | 'reports'

export default function TeacherDashboardLayout() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ id: string; full_name: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'teacher') {
        router.push('/')
        return
      }

      setProfile(profileData)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'classes', label: 'Minhas Turmas', icon: '👥' },
    { id: 'students', label: 'Alunos', icon: '🎓' },
    { id: 'grading', label: 'Correções', icon: '📝' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <TeacherDashboardContent />
      case 'classes':
        return <TeacherClassesContent />
      case 'students':
        return <TeacherStudentsContent />
      case 'grading':
        return <TeacherGradingContent />
      case 'reports':
        return <div className="p-6"><h2 className="text-2xl font-bold text-[#1e293b]">Relatórios em desenvolvimento...</h2></div>
      default:
        return <TeacherDashboardContent />
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#334155]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#334155] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 pattern-dots"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white/95 backdrop-blur-xl border-r-4 border-[#FFD700]/30 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-64'
        } md:w-64 fixed md:relative h-full z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-[#94a3b8]/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center">
                <span className="text-[#8B4513] font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1e293b] font-montserrat">SwiftEDU</h1>
                <p className="text-xs text-[#5D3A1F]">Professor</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all relative z-50 cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#334155] to-[#475569] text-white shadow-lg'
                    : 'text-[#5D3A1F] hover:bg-[#FFD700]/20 hover:text-[#1e293b]'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#94a3b8]/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center">
                <span className="text-[#8B4513] font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1e293b] truncate">
                  {profile?.full_name || 'Professor'}
                </p>
                <p className="text-xs text-[#5D3A1F] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#334155] to-[#475569] text-white rounded-lg font-medium hover:from-[#475569] hover:to-[#334155] transition-all relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b-4 border-[#FFD700]/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-[#5D3A1F] hover:bg-[#FFD700]/20 relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b] font-montserrat">
                    {sidebarItems.find(item => item.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-[#5D3A1F]">
                    Bem-vindo(a), {profile?.full_name || 'Professor'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-lg text-[#5D3A1F] hover:bg-[#FFD700]/20 relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}