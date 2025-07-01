'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import DashboardContent from './DashboardContent'
import UsersContent from './UsersContent'
import CoursesContent from './CoursesContent'
import AssessmentsContent from './AssessmentsContent'
import ReportsContent from './ReportsContent'
import SettingsContent from './SettingsContent'
import ContentManager from './ContentManager'
import NotificationCenter from './NotificationCenter'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { } = useAuth()

  const sections: Record<string, React.ComponentType> = {
    dashboard: DashboardContent,
    users: UsersContent,
    courses: CoursesContent,
    assessments: AssessmentsContent,
    content: ContentManager,
    reports: ReportsContent,
    settings: SettingsContent,
  }

  const renderContent = () => {
    const ContentComponent = sections[activeSection] || (() => children)
    return <ContentComponent />
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Usuários', icon: '👥' },
    { id: 'courses', label: 'Cursos', icon: '📚' },
    { id: 'assessments', label: 'Avaliações', icon: '📝' },
    { id: 'content', label: 'Conteúdo', icon: '🗂️' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await signOut()
      // Close sidebar on mobile after logout
      setSidebarOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      alert('Erro ao fazer logout. Tente novamente.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1426] via-[#1e3a8a] to-[#1f2937]">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 xl:w-80 bg-slate-900/95 backdrop-blur-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#0ea5e9]/20 flex flex-col`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-[#1e40af] to-[#0ea5e9] border-b-2 border-[#fbbf24]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#fbbf24] rounded-lg flex items-center justify-center mr-2 border border-[#0ea5e9]/30">
              <span className="text-[#1e40af] font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-white font-montserrat">SwiftEDU</h1>
          </div>
        </div>

        <nav className="mt-5 px-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`group flex items-center w-full px-3 py-2 mt-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-lg font-semibold border border-[#fbbf24]/30'
                  : 'text-[#cbd5e1] hover:bg-[#0ea5e9]/20 hover:text-white font-medium'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ pointerEvents: 'auto' }}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative z-50 cursor-pointer ${
              isLoggingOut 
                ? 'text-red-600 bg-red-500/10 cursor-not-allowed'
                : 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
            }`}
          >
            <span className="mr-3">{isLoggingOut ? '⏳' : '🚪'}</span>
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 xl:pl-80 min-h-screen">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-slate-900/90 backdrop-blur-xl border-b-2 border-[#0ea5e9] shadow-lg">
          <button
            className="px-4 border-r border-[#475569] text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0ea5e9] lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white capitalize font-montserrat">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <NotificationCenter />
              <div className="relative">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-full flex items-center justify-center border border-[#0ea5e9]/30">
                    <span className="text-[#1e40af] font-bold text-sm">A</span>
                  </div>
                  <span className="ml-2 text-sm font-semibold text-white hidden md:block">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="absolute inset-0 pattern-dots opacity-20"></div>
          {renderContent()}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}