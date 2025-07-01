'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, DashboardStats } from '@/lib/analytics'

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await getDashboardStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6 font-montserrat">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-semibold">Total de Alunos</p>
              <p className="text-2xl font-bold text-white">{stats?.totalStudents || 0}</p>
              <p className={`text-xs ${stats?.studentGrowth && stats.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.studentGrowth ? `${stats.studentGrowth > 0 ? '+' : ''}${stats.studentGrowth}%` : '0%'} este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-semibold">Cursos Ativos</p>
              <p className="text-2xl font-bold text-white">{stats?.activeCourses || 0}</p>
              <p className={`text-xs ${stats?.courseGrowth && stats.courseGrowth > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {stats?.courseGrowth ? `${stats.courseGrowth > 0 ? '+' : ''}${stats.courseGrowth}%` : '0%'} crescimento
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-semibold">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-white">{stats?.completionRate || 0}%</p>
              <p className={`text-xs ${stats?.completionGrowth && stats.completionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.completionGrowth ? `${stats.completionGrowth > 0 ? '+' : ''}${stats.completionGrowth}%` : '0%'} vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-semibold">Receita Mensal</p>
              <p className="text-2xl font-bold text-white">R$ {((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}k</p>
              <p className={`text-xs ${stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : '0%'} crescimento
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">💰</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}