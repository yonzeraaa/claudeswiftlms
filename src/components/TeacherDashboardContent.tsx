'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherDashboardContent() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    averageGrade: 0
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    submitted_at: string
    grade: number | null
    assessments?: { title: string }
    profiles?: { full_name: string }
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get teacher's classes
      const { data: classes } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          courses(id, title),
          enrollments(count)
        `)
        .eq('teacher_id', user.id)

      // Get pending grading count
      const { data: pendingAssessments } = await supabase
        .from('assessment_submissions')
        .select('id')
        .is('grade', null)
        .in('assessment_id', classes?.map(c => c.course_id) || [])

      // Get recent activity
      const { data: activity } = await supabase
        .from('assessment_submissions')
        .select(`
          *,
          assessments(title),
          profiles(full_name)
        `)
        .in('assessment_id', classes?.map(c => c.course_id) || [])
        .order('submitted_at', { ascending: false })
        .limit(5)

      setStats({
        totalClasses: classes?.length || 0,
        totalStudents: classes?.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0) || 0,
        pendingGrading: pendingAssessments?.length || 0,
        averageGrade: 85 // Calculate from real data later
      })

      setRecentActivity(activity || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
        <p className="text-[#5D3A1F] mt-2">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 rounded-2xl border-4 border-[#FFD700]/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2C1A0E] font-montserrat mb-2">
              👋 Bem-vindo, Professor!
            </h1>
            <p className="text-[#5D3A1F] text-lg">
              Gerencie suas turmas e acompanhe o progresso dos seus alunos
            </p>
          </div>
          <div className="text-6xl opacity-20">🎓</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">{stats.totalClasses}</h3>
          <p className="text-[#5D3A1F]">Turmas Ativas</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">🎓</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">{stats.totalStudents}</h3>
          <p className="text-[#5D3A1F]">Total de Alunos</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">{stats.pendingGrading}</h3>
          <p className="text-[#5D3A1F]">Correções Pendentes</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">{stats.averageGrade.toFixed(1)}</h3>
          <p className="text-[#5D3A1F]">Média Geral</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h3 className="text-xl font-semibold text-[#2C1A0E] mb-4">🚀 Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <div className="text-2xl mb-2">📚</div>
            <span className="font-medium">Nova Aula</span>
          </button>

          <button className="p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <div className="text-2xl mb-2">📝</div>
            <span className="font-medium">Criar Prova</span>
          </button>

          <button className="p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <div className="text-2xl mb-2">✅</div>
            <span className="font-medium">Corrigir Provas</span>
          </button>

          <button className="p-4 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <div className="text-2xl mb-2">📈</div>
            <span className="font-medium">Relatórios</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h3 className="text-xl font-semibold text-[#2C1A0E] mb-4">📋 Atividade Recente</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center">
                  <span className="text-[#8B4513] text-sm font-semibold">
                    {activity.profiles?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#2C1A0E]">
                    {activity.profiles?.full_name || 'Aluno'}
                  </p>
                  <p className="text-sm text-[#5D3A1F]">
                    Submeteu: {activity.assessments?.title || 'Avaliação'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#5D3A1F]">
                  {new Date(activity.submitted_at).toLocaleDateString('pt-BR')}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.grade ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.grade ? 'Corrigido' : 'Pendente'}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-[#5D3A1F]">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Preview */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h3 className="text-xl font-semibold text-[#2C1A0E] mb-4">📅 Próximas Aulas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-[#FFD700] flex flex-col items-center justify-center">
                <span className="text-xs text-[#8B4513]">DEZ</span>
                <span className="font-bold text-[#8B4513]">15</span>
              </div>
              <div>
                <p className="font-semibold text-[#2C1A0E]">Matemática Avançada</p>
                <p className="text-sm text-[#5D3A1F]">Turma A - 14:00</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Hoje
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-[#FFD700] flex flex-col items-center justify-center">
                <span className="text-xs text-[#8B4513]">DEZ</span>
                <span className="font-bold text-[#8B4513]">16</span>
              </div>
              <div>
                <p className="font-semibold text-[#2C1A0E]">Física Experimental</p>
                <p className="text-sm text-[#5D3A1F]">Turma B - 09:00</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Amanhã
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}