'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface AssessmentSubmission {
  id: string
  assessment_id: string
  student_id: string
  answers: Record<string, unknown>
  submitted_at: string
  grade: number | null
  feedback: string | null
  assessments: {
    id: string
    title: string
    type: string
    total_points: number
  }
  profiles: {
    full_name: string
    email: string
  }
}

export default function TeacherGradingContent() {
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<AssessmentSubmission | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('pending')


  const loadSubmissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get teacher's classes first
      const { data: teacherClasses } = await supabase
        .from('teacher_classes')
        .select('course_id')
        .eq('teacher_id', user.id)

      if (!teacherClasses?.length) {
        setSubmissions([])
        setLoading(false)
        return
      }

      const courseIds = teacherClasses.map(tc => tc.course_id)

      // Get assessments for teacher's courses
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .in('course_id', courseIds)

      if (!assessments?.length) {
        setSubmissions([])
        setLoading(false)
        return
      }

      const assessmentIds = assessments.map(a => a.id)

      // Build query
      let query = supabase
        .from('assessment_submissions')
        .select(`
          *,
          assessments(id, title, type, total_points),
          profiles(full_name, email)
        `)
        .in('assessment_id', assessmentIds)
        .order('submitted_at', { ascending: false })

      // Apply filter
      if (filter === 'pending') {
        query = query.is('grade', null)
      } else if (filter === 'graded') {
        query = query.not('grade', 'is', null)
      }

      const { data: submissionsData } = await query

      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])


  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !gradeValue) return

    try {
      const { error } = await supabase
        .from('assessment_submissions')
        .update({
          grade: parseFloat(gradeValue),
          feedback: feedback.trim() || null,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id)

      if (error) throw error

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade: parseFloat(gradeValue), feedback: feedback.trim() || null }
          : sub
      ))

      setSelectedSubmission(null)
      setGradeValue('')
      setFeedback('')
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Erro ao salvar nota')
    }
  }

  const renderAnswers = (answers: Record<string, unknown>) => {
    if (!answers || typeof answers !== 'object') {
      return <p className="text-[#5D3A1F]">Respostas não disponíveis</p>
    }

    return (
      <div className="space-y-4">
        {Object.entries(answers).map(([questionId, answer], index) => (
          <div key={questionId} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-[#1e293b] mb-2">
              Questão {index + 1}
            </h4>
            <div className="text-[#5D3A1F]">
              {typeof answer === 'string' ? answer : JSON.stringify(answer)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
        <p className="text-[#5D3A1F] mt-2">Carregando submissões...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b] font-montserrat">
            📝 Correções
          </h1>
          <p className="text-[#5D3A1F] mt-1">
            Corrija as avaliações submetidas pelos seus alunos
          </p>
        </div>
        
        {/* Filter */}
        <div className="flex space-x-2">
          {[
            { key: 'pending', label: 'Pendentes', icon: '⏳' },
            { key: 'graded', label: 'Corrigidas', icon: '✅' },
            { key: 'all', label: 'Todas', icon: '📋' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as 'all' | 'pending' | 'graded')}
              className={`px-4 py-2 rounded-lg font-medium transition-all relative z-50 cursor-pointer ${
                filter === filterOption.key
                  ? 'bg-[#8B4513] text-white'
                  : 'bg-white/70 text-[#5D3A1F] hover:bg-[#FFD700]/20'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              {filterOption.icon} {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <h3 className="text-2xl font-bold text-[#1e293b]">
            {submissions.filter(s => !s.grade).length}
          </h3>
          <p className="text-[#5D3A1F]">Pendentes</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-2xl font-bold text-[#1e293b]">
            {submissions.filter(s => s.grade !== null).length}
          </h3>
          <p className="text-[#5D3A1F]">Corrigidas</p>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-[#1e293b]">
            {submissions.length > 0 ? (
              submissions.filter(s => s.grade !== null).reduce((avg, s) => avg + (s.grade || 0), 0) / 
              submissions.filter(s => s.grade !== null).length || 0
            ).toFixed(1) : '0.0'}
          </h3>
          <p className="text-[#5D3A1F]">Média</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h3 className="text-xl font-semibold text-[#1e293b] mb-4">
          📋 Submissões ({submissions.length})
        </h3>
        
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center">
                  <span className="text-[#8B4513] font-semibold">
                    {submission.profiles?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#1e293b]">
                    {submission.profiles?.full_name || 'Nome não disponível'}
                  </p>
                  <p className="text-sm text-[#5D3A1F]">
                    {submission.assessments?.title || 'Avaliação'}
                  </p>
                  <p className="text-xs text-[#5D3A1F]">
                    Submetido em {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {submission.grade !== null ? (
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#1e293b]">
                      {submission.grade}/{submission.assessments?.total_points || 100}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium ml-2">
                      Corrigida
                    </span>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pendente
                  </span>
                )}

                <button
                  onClick={() => setSelectedSubmission(submission)}
                  className="px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm font-medium hover:bg-[#654321] transition-all relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  {submission.grade !== null ? '👁️ Ver' : '✏️ Corrigir'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[#1e293b] mb-2">
              Nenhuma submissão encontrada
            </h3>
            <p className="text-[#5D3A1F]">
              {filter === 'pending' ? 'Não há correções pendentes' : 'Nenhuma submissão disponível'}
            </p>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[#94a3b8]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-[#1e293b]">
                    {selectedSubmission.grade !== null ? 'Visualizar Correção' : 'Corrigir Avaliação'}
                  </h3>
                  <p className="text-[#5D3A1F]">
                    {selectedSubmission.profiles?.full_name} - {selectedSubmission.assessments?.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(null)
                    setGradeValue('')
                    setFeedback('')
                  }}
                  className="text-[#5D3A1F] hover:text-[#475569] relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Student Answers */}
              <div>
                <h4 className="text-lg font-semibold text-[#1e293b] mb-3">
                  📝 Respostas do Aluno
                </h4>
                {renderAnswers(selectedSubmission.answers)}
              </div>

              {/* Grading Section */}
              {selectedSubmission.grade === null ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#1e293b]">
                    📊 Correção
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#5D3A1F] mb-2">
                      Nota (máximo: {selectedSubmission.assessments?.total_points || 100})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedSubmission.assessments?.total_points || 100}
                      step="0.1"
                      value={gradeValue}
                      onChange={(e) => setGradeValue(e.target.value)}
                      className="w-full p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      placeholder="Ex: 8.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5D3A1F] mb-2">
                      Feedback (opcional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700] h-24"
                      placeholder="Comentários sobre o desempenho do aluno..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleGradeSubmission}
                      disabled={!gradeValue}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#334155] to-[#475569] text-white rounded-lg font-medium hover:from-[#475569] hover:to-[#334155] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      ✅ Salvar Correção
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubmission(null)
                        setGradeValue('')
                        setFeedback('')
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#1e293b]">
                    📊 Correção
                  </h4>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1e293b]">Nota:</span>
                      <span className="text-xl font-bold text-green-600">
                        {selectedSubmission.grade}/{selectedSubmission.assessments?.total_points || 100}
                      </span>
                    </div>
                    
                    {selectedSubmission.feedback && (
                      <div>
                        <span className="font-medium text-[#1e293b]">Feedback:</span>
                        <p className="text-[#5D3A1F] mt-1">{selectedSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}