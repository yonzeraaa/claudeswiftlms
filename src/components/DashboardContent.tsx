'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getChartData, getRecentActivity, ChartData, ActivityItem, DashboardStats } from '@/lib/analytics'
import { getPopularCourses, Course } from '@/lib/courses'

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [popularCourses, setPopularCourses] = useState<Course[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, chartData, coursesData, activityData] = await Promise.all([
          getDashboardStats(),
          getChartData(),
          getPopularCourses(4),
          getRecentActivity()
        ])
        
        setStats(statsData)
        setChartData(chartData)
        setPopularCourses(coursesData)
        setRecentActivity(activityData)
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
      <h1 className="text-3xl font-bold text-[#2C1A0E] mb-6 font-montserrat">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Total de Alunos</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">{stats?.totalStudents || 0}</p>
              <p className={`text-xs ${stats?.studentGrowth && stats.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.studentGrowth ? `${stats.studentGrowth > 0 ? '+' : ''}${stats.studentGrowth}%` : '0%'} este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">👥</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Cursos Ativos</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">{stats?.activeCourses || 0}</p>
              <p className={`text-xs ${stats?.courseGrowth && stats.courseGrowth > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {stats?.courseGrowth ? `${stats.courseGrowth > 0 ? '+' : ''}${stats.courseGrowth}%` : '0%'} crescimento
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">📚</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">{stats?.completionRate || 0}%</p>
              <p className={`text-xs ${stats?.completionGrowth && stats.completionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.completionGrowth ? `${stats.completionGrowth > 0 ? '+' : ''}${stats.completionGrowth}%` : '0%'} vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">📈</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Receita Mensal</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">R$ {((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}k</p>
              <p className={`text-xs ${stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : '0%'} crescimento
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Chart */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Engajamento dos Alunos</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#FFD700]/20 rounded-t-lg relative" style={{height: `${data.completion * 2}px`}}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#FFD700] to-[#B8860B] rounded-t-lg" style={{height: `${data.completion * 1.5}px`}}></div>
                </div>
                <p className="text-[#3D2914] text-sm mt-2 font-medium">{data.month}</p>
                <p className="text-[#2C1A0E] text-xs font-semibold">{data.completion}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Cursos Mais Populares</h2>
          <div className="space-y-4">
            {popularCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-[#2C1A0E] font-semibold">{course.title}</p>
                  <p className="text-[#3D2914] text-sm font-medium">{course.enrollment_count || 0} alunos matriculados</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: `${course.progress || 85}%`}}></div>
                  </div>
                </div>
                <span className="text-[#2C1A0E] font-bold ml-4">{course.progress || 85}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Atividade Recente</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center mr-3`}>
                  <span className={`text-${activity.color}-600 text-sm`}>
                    {activity.type === 'completion' ? '✓' : activity.type === 'enrollment' ? '📚' : activity.type === 'signup' ? '👤' : '📝'}
                  </span>
                </div>
                <div>
                  <p className="text-[#2C1A0E] font-semibold">{activity.user} {activity.action}</p>
                  <p className="text-[#3D2914] text-sm font-medium">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}