'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Student {
  id: string
  student_id: string
  enrolled_at: string
  status: string
  progress_percentage: number
  last_activity: string
  profiles: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  courses: {
    title: string
    category: string
  }
}

export default function TeacherStudentsContent() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get teacher's classes
      const { data: teacherClasses } = await supabase
        .from('teacher_classes')
        .select('course_id')
        .eq('teacher_id', user.id)

      if (!teacherClasses?.length) {
        setStudents([])
        setLoading(false)
        return
      }

      const courseIds = teacherClasses.map(tc => tc.course_id)

      // Get enrollments for teacher's courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles(id, full_name, email, avatar_url),
          courses(title, category)
        `)
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false })

      // Calculate progress for each student (mock data for now)
      const studentsWithProgress = (enrollments || []).map(enrollment => ({
        ...enrollment,
        progress_percentage: Math.floor(Math.random() * 100), // Replace with real calculation
        last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

      setStudents(studentsWithProgress)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (studentId: string, message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // This would integrate with the messaging system (Stage 33)
      console.log('Sending message to student:', studentId, message)
      alert('Mensagem enviada! (Funcionalidade completa no Estágio 33)')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
        <p className="text-[#5D3A1F] mt-2">Carregando alunos...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2C1A0E] font-montserrat">
            🎓 Meus Alunos
          </h1>
          <p className="text-[#5D3A1F] mt-1">
            Acompanhe o progresso e comunique-se com seus alunos
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativos' },
              { key: 'inactive', label: 'Inativos' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as 'all' | 'active' | 'inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-all relative z-50 cursor-pointer ${
                  statusFilter === filter.key
                    ? 'bg-[#8B4513] text-white'
                    : 'bg-white/70 text-[#5D3A1F] hover:bg-[#FFD700]/20'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">{students.length}</h3>
          <p className="text-[#5D3A1F]">Total de Alunos</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">
            {students.filter(s => s.status === 'active').length}
          </h3>
          <p className="text-[#5D3A1F]">Ativos</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">
            {students.length > 0 ? (
              students.reduce((avg, s) => avg + s.progress_percentage, 0) / students.length
            ).toFixed(1) : '0.0'}%
          </h3>
          <p className="text-[#5D3A1F]">Progresso Médio</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-2xl font-bold text-[#2C1A0E]">
            {students.filter(s => s.progress_percentage >= 80).length}
          </h3>
          <p className="text-[#5D3A1F]">Acima de 80%</p>
        </div>
      </div>

      {/* Students List */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h3 className="text-xl font-semibold text-[#2C1A0E] mb-4">
          📋 Lista de Alunos ({filteredStudents.length})
        </h3>
        
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center">
                  {student.profiles?.avatar_url ? (
                    <img 
                      src={student.profiles.avatar_url} 
                      alt={student.profiles.full_name || 'Avatar'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[#8B4513] font-semibold text-lg">
                      {student.profiles?.full_name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-[#2C1A0E]">
                      {student.profiles?.full_name || 'Nome não disponível'}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-[#5D3A1F]">
                    {student.profiles?.email || 'Email não disponível'}
                  </p>
                  <p className="text-sm text-[#5D3A1F]">
                    {student.courses?.title} • {student.courses?.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Progress */}
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-medium text-[#2C1A0E]">
                    {student.progress_percentage}% completo
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] h-2 rounded-full transition-all"
                      style={{ width: `${student.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="px-3 py-2 bg-[#FFD700]/20 text-[#8B4513] rounded-lg text-sm font-medium hover:bg-[#FFD700]/30 transition-all relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => {
                      const message = prompt('Digite sua mensagem:')
                      if (message) sendMessage(student.student_id, message)
                    }}
                    className="px-3 py-2 bg-[#8B4513]/20 text-[#8B4513] rounded-lg text-sm font-medium hover:bg-[#8B4513]/30 transition-all relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    💬 Mensagem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-[#2C1A0E] mb-2">
              Nenhum aluno encontrado
            </h3>
            <p className="text-[#5D3A1F]">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Não há alunos matriculados nas suas turmas'}
            </p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#D2B48C]">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center">
                    {selectedStudent.profiles?.avatar_url ? (
                      <img 
                        src={selectedStudent.profiles.avatar_url} 
                        alt={selectedStudent.profiles.full_name || 'Avatar'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[#8B4513] font-bold text-xl">
                        {selectedStudent.profiles?.full_name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C1A0E]">
                      {selectedStudent.profiles?.full_name || 'Nome não disponível'}
                    </h3>
                    <p className="text-[#5D3A1F]">{selectedStudent.profiles?.email}</p>
                    <p className="text-sm text-[#5D3A1F]">
                      Matriculado em {new Date(selectedStudent.enrolled_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-[#5D3A1F] hover:text-[#3D2914] relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Progress Section */}
              <div>
                <h4 className="text-lg font-semibold text-[#2C1A0E] mb-3">📊 Progresso</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#2C1A0E]">
                      {selectedStudent.progress_percentage}%
                    </div>
                    <div className="text-sm text-[#5D3A1F]">Conclusão</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#2C1A0E]">8.5</div>
                    <div className="text-sm text-[#5D3A1F]">Média</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#2C1A0E]">5</div>
                    <div className="text-sm text-[#5D3A1F]">Atividades</div>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <h4 className="text-lg font-semibold text-[#2C1A0E] mb-3">📚 Curso</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-[#2C1A0E]">{selectedStudent.courses?.title}</p>
                  <p className="text-sm text-[#5D3A1F]">{selectedStudent.courses?.category}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold text-[#2C1A0E] mb-3">🕒 Atividade Recente</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#2C1A0E]">Completou a Lição 5</p>
                    <p className="text-xs text-[#5D3A1F]">
                      {new Date(selectedStudent.last_activity).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#2C1A0E]">Submeteu Quiz 3</p>
                    <p className="text-xs text-[#5D3A1F]">2 dias atrás</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const message = prompt('Digite sua mensagem:')
                    if (message) sendMessage(selectedStudent.student_id, message)
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white rounded-lg font-medium hover:from-[#654321] hover:to-[#8B4513] transition-all relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  💬 Enviar Mensagem
                </button>
                <button className="px-6 py-3 bg-[#FFD700]/20 text-[#8B4513] rounded-lg font-medium hover:bg-[#FFD700]/30 transition-all relative z-50 cursor-pointer" style={{ pointerEvents: 'auto' }}>
                  📈 Ver Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}