'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentHomeContent from './StudentHomeContent'
import StudentCoursesContent from './StudentCoursesContent'
import StudentProgressContent from './StudentProgressContent'
import StudentScheduleContent from './StudentScheduleContent'

export default function StudentDashboardLayout() {
  const [activeSection, setActiveSection] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const sections: Record<string, React.ComponentType> = {
    home: StudentHomeContent,
    courses: StudentCoursesContent,
    progress: StudentProgressContent,
    schedule: StudentScheduleContent,
  }

  const renderContent = () => {
    const ContentComponent = sections[activeSection]
    return <ContentComponent />
  }

  const menuItems = [
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'courses', label: 'Meus Cursos', icon: '📚' },
    { id: 'progress', label: 'Progresso', icon: '📊' },
    { id: 'schedule', label: 'Agenda', icon: '📅' },
  ]

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#654321] via-[#8B4513] to-[#654321]">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 xl:w-80 bg-white/95 backdrop-blur-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-[#FFD700] to-[#B8860B] border-b-2 border-[#8B4513]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#654321] rounded-lg flex items-center justify-center mr-2">
              <span className="text-[#FFD700] font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-[#3D2914] font-montserrat">SwiftEDU</h1>
          </div>
        </div>

        <nav className="mt-5 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`group flex items-center w-full px-3 py-2 mt-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] shadow-lg font-semibold'
                  : 'text-[#3D2914] hover:bg-[#FFD700]/20 hover:text-[#2C1A0E] font-medium'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Student Profile */}
        <div className="absolute bottom-16 left-2 right-2 p-3 bg-white/50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center">
              <span className="text-[#2C1A0E] font-bold text-sm">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-[#2C1A0E] font-semibold text-sm">João Silva</p>
              <p className="text-[#3D2914] font-medium text-xs">Estudante</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-2 right-2">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <span className="mr-3">🚪</span>
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 xl:pl-80 flex flex-col flex-1">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/90 backdrop-blur-xl border-b-2 border-[#FFD700] shadow-lg">
          <button
            className="px-4 border-r border-[#D2B48C] text-[#3D2914] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFD700] lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#2C1A0E] capitalize font-montserrat">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center">
                    <span className="text-[#2C1A0E] font-bold text-sm">JD</span>
                  </div>
                  <span className="ml-2 text-sm font-semibold text-[#2C1A0E] hidden md:block">João Silva</span>
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