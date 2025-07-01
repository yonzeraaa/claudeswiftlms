'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TeacherClass {
  id: string
  course_id: string
  teacher_id: string
  semester: string
  year: number
  max_students: number
  created_at: string
  courses: {
    id: string
    title: string
    description: string
    category: string
  }
  enrollments: Array<{
    id: string
    student_id: string
    enrolled_at: string
    status: string
    profiles?: { full_name: string; email: string }
  }>
}

export default function TeacherClassesContent() {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null)
  const [showStudents, setShowStudents] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: classesData } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          courses(id, title, description, category),
          enrollments(
            id,
            student_id,
            enrolled_at,
            status,
            profiles(full_name, email)
          )
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      setClasses(classesData || [])
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getClassStats = (classItem: TeacherClass) => {
    const enrollments = classItem.enrollments || []
    const activeStudents = enrollments.filter(e => e.status === 'active').length
    const completionRate = 75 // Calculate from real data later
    
    return {
      totalStudents: enrollments.length,
      activeStudents,
      completionRate
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
        <p className="text-[#5D3A1F] mt-2">Carregando turmas...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C1A0E] font-montserrat">
            👥 Minhas Turmas
          </h1>
          <p className="text-[#5D3A1F] mt-1">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-xl font-medium hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
          📚 Nova Turma
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => {
          const stats = getClassStats(classItem)
          
          return (
            <div key={classItem.id} className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-all">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#2C1A0E] mb-1">
                    {classItem.courses.title}
                  </h3>
                  <p className="text-sm text-[#5D3A1F] mb-2">
                    {classItem.semester} {classItem.year}
                  </p>
                  <span className="px-2 py-1 bg-[#FFD700]/20 text-[#8B4513] rounded-full text-xs font-medium">
                    {classItem.courses.category}
                  </span>
                </div>
                <div className="text-2xl">📚</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-xl font-bold text-[#2C1A0E]">{stats.totalStudents}</div>
                  <div className="text-xs text-[#5D3A1F]">Alunos</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-xl font-bold text-[#2C1A0E]">{stats.completionRate}%</div>
                  <div className="text-xs text-[#5D3A1F]">Conclusão</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-[#5D3A1F] mb-1">
                  <span>Progresso da Turma</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] h-2 rounded-full transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedClass(classItem)
                    setShowStudents(true)
                  }}
                  className="flex-1 px-3 py-2 bg-[#FFD700]/20 text-[#8B4513] rounded-lg text-sm font-medium hover:bg-[#FFD700]/30 transition-all relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  👥 Ver Alunos
                </button>
                <button className="flex-1 px-3 py-2 bg-[#8B4513]/20 text-[#8B4513] rounded-lg text-sm font-medium hover:bg-[#8B4513]/30 transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
                  📊 Relatórios
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-[#2C1A0E] mb-2">
            Nenhuma turma encontrada
          </h3>
          <p className="text-[#5D3A1F] mb-4">
            Comece criando sua primeira turma
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-xl font-medium hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
            📚 Criar Primeira Turma
          </button>
        </div>
      )}

      {/* Students Modal */}
      {showStudents && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#D2B48C]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-[#2C1A0E]">
                    Alunos - {selectedClass.courses.title}
                  </h3>
                  <p className="text-[#5D3A1F]">
                    {selectedClass.enrollments?.length || 0} alunos matriculados
                  </p>
                </div>
                <button
                  onClick={() => setShowStudents(false)}
                  className="text-[#5D3A1F] hover:text-[#3D2914] relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedClass.enrollments?.map((enrollment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center">
                        <span className="text-[#8B4513] font-semibold">
                          {enrollment.profiles?.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#2C1A0E]">
                          {enrollment.profiles?.full_name || 'Nome não disponível'}
                        </p>
                        <p className="text-sm text-[#5D3A1F]">
                          {enrollment.profiles?.email || 'Email não disponível'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        enrollment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <p className="text-xs text-[#5D3A1F] mt-1">
                        Desde {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-[#5D3A1F]">Nenhum aluno matriculado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}