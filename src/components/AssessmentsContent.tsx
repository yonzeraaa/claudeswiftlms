'use client'

import { useState, useEffect } from 'react'
import { getAllAssessments, getAssessmentStats, createAssessment, updateAssessment, getQuestionsByAssessment, Assessment, AssessmentStats, Question } from '@/lib/assessments'
import { getAllCourses, Course } from '@/lib/courses'
import QuestionBank from './QuestionBank'

export default function AssessmentsContent() {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('assessments')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [stats, setStats] = useState<AssessmentStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    type: 'quiz' as 'quiz' | 'exam' | 'project',
    time_limit: 60,
    passing_score: 7.0
  })
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [assessmentsData, statsData, coursesData] = await Promise.all([
        getAllAssessments(),
        getAssessmentStats(),
        getAllCourses()
      ])
      setAssessments(assessmentsData)
      setStats(statsData)
      setCourses(coursesData)
    } catch {
      // Error loading assessments data
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAssessment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAssessment({
        ...formData,
        status: 'draft'
      })
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        course_id: '',
        type: 'quiz',
        time_limit: 60,
        passing_score: 7.0
      })
      await loadData()
    } catch (error) {
      console.error('Error creating assessment:', error)
      alert('Erro ao criar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditAssessment(assessment: Assessment) {
    setEditingAssessment(assessment)
    setFormData({
      title: assessment.title,
      description: assessment.description || '',
      course_id: assessment.course_id,
      type: assessment.type,
      time_limit: assessment.time_limit || 60,
      passing_score: assessment.passing_score
    })
    setShowEditModal(true)
  }

  async function handleUpdateAssessment(e: React.FormEvent) {
    e.preventDefault()
    if (!editingAssessment) return
    
    setSubmitting(true)
    try {
      await updateAssessment(editingAssessment.id, formData)
      setShowEditModal(false)
      setEditingAssessment(null)
      setFormData({
        title: '',
        description: '',
        course_id: '',
        type: 'quiz',
        time_limit: 60,
        passing_score: 7.0
      })
      await loadData()
    } catch (error) {
      console.error('Error updating assessment:', error)
      alert('Erro ao atualizar avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadQuestions(assessmentId: string) {
    try {
      const questionsData = await getQuestionsByAssessment(assessmentId)
      setQuestions(questionsData)
      setActiveTab('questions')
    } catch (error) {
      console.error('Error loading questions:', error)
      alert('Erro ao carregar questões.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white font-semibold font-montserrat">Sistema de Avaliações</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('questions')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            🗄️ Banco de Questões
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="relative z-50 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            style={{ pointerEvents: 'auto' }}
          >
            + Nova Avaliação
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Total de Avaliações</h3>
          <p className="text-2xl font-bold text-white">{stats?.totalAssessments || 0}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Pendentes de Correção</h3>
          <p className="text-2xl font-bold text-white">{stats?.pendingGrading || 0}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Média Geral</h3>
          <p className="text-2xl font-bold text-white">{stats?.averageScore.toFixed(1) || '0.0'}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Taxa de Aprovação</h3>
          <p className="text-2xl font-bold text-white">{stats?.passRate.toFixed(0) || 0}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30 mb-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'assessments' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Avaliações
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'questions' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Banco de Questões
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'results' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Resultados
          </button>
        </div>
      </div>

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-600">
                  <th className="text-left p-3 text-white font-semibold">Título</th>
                  <th className="text-left p-3 text-white font-semibold">Curso</th>
                  <th className="text-left p-3 text-white font-semibold">Tipo</th>
                  <th className="text-left p-3 text-white font-semibold">Questões</th>
                  <th className="text-left p-3 text-white font-semibold">Submissões</th>
                  <th className="text-left p-3 text-white font-semibold">Média</th>
                  <th className="text-left p-3 text-white font-semibold">Status</th>
                  <th className="text-left p-3 text-white font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                    <td className="p-3 text-slate-300 font-medium">{assessment.title}</td>
                    <td className="p-3 text-slate-300 font-medium">{assessment.course?.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 
                        assessment.type === 'exam' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {assessment.type === 'quiz' ? 'Quiz' : assessment.type === 'exam' ? 'Prova' : 'Projeto'}
                      </span>
                    </td>
                    <td className="p-3 text-white">{assessment.questions_count}</td>
                    <td className="p-3 text-white">{assessment.submissions_count}</td>
                    <td className="p-3 text-slate-300 font-medium">{assessment.average_score?.toFixed(1) || '0.0'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditAssessment(assessment)}
                          className="relative z-50 cursor-pointer text-sky-400 hover:text-sky-300 text-sm"
                          style={{ pointerEvents: 'auto' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => loadQuestions(assessment.id)}
                          className="relative z-50 cursor-pointer text-amber-400 hover:text-amber-300 text-sm"
                          style={{ pointerEvents: 'auto' }}
                        >
                          Questões
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <QuestionBank mode="bank" />
      )}

      {activeTab === 'questions-old' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Banco de Questões</h3>
            <button 
              onClick={() => alert('Funcionalidade em desenvolvimento')}
              className="relative z-50 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-700 text-white px-4 py-2 rounded-lg text-sm"
              style={{ pointerEvents: 'auto' }}
            >
              + Nova Questão
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="p-4 bg-slate-800/80 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium flex-1">{question.question_text}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.type === 'multiple_choice' ? 'Múltipla Escolha' : question.type === 'essay' ? 'Dissertativa' : 'V/F'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-300 font-medium">
                  <span>Categoria: {question.category}</span>
                  <span>Pontos: {question.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-lg font-bold text-white mb-4">Relatório de Desempenho</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-2">Distribuição de Notas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">9.0 - 10.0</span>
                  <span className="text-slate-300 font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">8.0 - 8.9</span>
                  <span className="text-slate-300 font-medium">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">7.0 - 7.9</span>
                  <span className="text-slate-300 font-medium">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">&lt; 7.0</span>
                  <span className="text-slate-300 font-medium">15%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-2">Questões mais Difíceis</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="text-white font-medium">Closures em JavaScript</p>
                  <p className="text-slate-300 font-medium">Taxa de acerto: 45%</p>
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">Async/Await vs Promises</p>
                  <p className="text-slate-300 font-medium">Taxa de acerto: 52%</p>
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">Event Loop</p>
                  <p className="text-slate-300 font-medium">Taxa de acerto: 58%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Nova Avaliação</h3>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <input
                type="text"
                placeholder="Título da avaliação"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <textarea
                placeholder="Descrição da avaliação"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <select 
                value={formData.course_id}
                onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="">Selecionar curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'quiz' | 'exam' | 'project'})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="quiz">Quiz</option>
                <option value="exam">Prova</option>
                <option value="project">Projeto</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  value={formData.time_limit || ''}
                  onChange={(e) => setFormData({...formData, time_limit: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Nota mínima"
                  value={formData.passing_score || ''}
                  onChange={(e) => setFormData({...formData, passing_score: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-600 text-slate-200 py-2 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 text-white py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Criando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assessment Modal */}
      {showEditModal && editingAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Editar Avaliação</h3>
            <form onSubmit={handleUpdateAssessment} className="space-y-4">
              <input
                type="text"
                placeholder="Título da avaliação"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <textarea
                placeholder="Descrição da avaliação"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <select 
                value={formData.course_id}
                onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="">Selecionar curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'quiz' | 'exam' | 'project'})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="quiz">Quiz</option>
                <option value="exam">Prova</option>
                <option value="project">Projeto</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  value={formData.time_limit || ''}
                  onChange={(e) => setFormData({...formData, time_limit: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Nota mínima"
                  value={formData.passing_score || ''}
                  onChange={(e) => setFormData({...formData, passing_score: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-600 text-slate-200 py-2 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 text-white py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}