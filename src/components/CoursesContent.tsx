'use client'

import { useState, useEffect } from 'react'
import { getAllCourses, getCourseStats, createCourse, updateCourse, deleteCourse, getCourseById, getInstructors, Course, CourseStats } from '@/lib/courses'

export default function CoursesContent() {
  const [showModal, setShowModal] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [instructors, setInstructors] = useState<Array<{id: string, full_name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    instructor_id: '',
    duration_hours: 0
  })
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      console.log('Carregando dados dos cursos...')
      const [coursesData, statsData, instructorsData] = await Promise.all([
        getAllCourses(),
        getCourseStats(), 
        getInstructors()
      ])
      console.log('Dados carregados:', {
        cursos: coursesData.length,
        stats: statsData
      })
      setCourses(coursesData)
      setStats(statsData)
      setInstructors(instructorsData)
    } catch (error) {
      console.error('Error loading courses data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createCourse({
        ...formData,
        status: 'draft'
      })
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        instructor_id: '',
        duration_hours: 0,
              })
      await loadData()
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Erro ao criar curso.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditCourse(course: Course) {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      instructor_id: course.instructor_id,
      duration_hours: course.duration_hours,
          })
    setShowEditModal(true)
  }

  async function handleUpdateCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCourse) return
    
    setSubmitting(true)
    try {
      await updateCourse(editingCourse.id, formData)
      setShowEditModal(false)
      setEditingCourse(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        instructor_id: '',
        duration_hours: 0,
              })
      await loadData()
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Erro ao atualizar curso.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleViewCourse(courseId: string) {
    try {
      const course = await getCourseById(courseId)
      setSelectedCourse(course)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error loading course details:', error)
      alert('Erro ao carregar detalhes do curso.')
    }
  }

  async function handleDeleteCourse(courseId: string, courseTitle: string) {
    if (confirm(`Tem certeza que deseja excluir o curso "${courseTitle}"? Esta ação não pode ser desfeita.`)) {
      try {
        console.log('Tentando excluir curso:', courseId)
        await deleteCourse(courseId)
        console.log('Curso excluído com sucesso')
        
        // Atualizar a lista local imediatamente
        setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId))
        
        alert('Curso excluído com sucesso!')
        
        // Recarregar dados completos
        await loadData()
      } catch (error) {
        console.error('Error deleting course:', error)
        alert(`Erro ao excluir curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white font-semibold font-montserrat">Gestão de Cursos</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="relative z-50 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
          style={{ pointerEvents: 'auto' }}
        >
          + Novo Curso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Total de Cursos</h3>
          <p className="text-2xl font-bold text-white">{stats?.totalCourses || 0}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Cursos Ativos</h3>
          <p className="text-2xl font-bold text-white">{stats?.activeCourses || 0}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Em Desenvolvimento</h3>
          <p className="text-2xl font-bold text-white">{stats?.draftCourses || 0}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Total de Matrículas</h3>
          <p className="text-2xl font-bold text-white">{stats?.totalEnrollments || 0}</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                <p className="text-slate-300 font-medium text-sm mb-2">Categoria: {course.category}</p>
                <p className="text-slate-300 font-medium text-sm">Instrutor: {course.instructor?.full_name || 'N/A'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.status === 'published' ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">Matrículas</span>
                <span className="text-slate-300 font-medium">{course.enrollment_count || 0}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-sky-400 to-sky-500 h-2 rounded-full" style={{width: `${Math.min(100, (course.enrollment_count || 0) * 2)}%`}}></div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-slate-300 font-medium text-sm">📅 {course.duration_hours}h</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditCourse(course)}
                className="relative z-50 cursor-pointer flex-1 bg-gradient-to-r from-sky-600 to-sky-700 text-white py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all text-sm"
                style={{ pointerEvents: 'auto' }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleViewCourse(course.id)}
                className="relative z-50 cursor-pointer px-4 py-2 border-2 border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-800/50 transition-colors text-sm"
                style={{ pointerEvents: 'auto' }}
              >
                Ver
              </button>
              <button 
                onClick={() => handleDeleteCourse(course.id, course.title)}
                className="relative z-50 cursor-pointer px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm"
                style={{ pointerEvents: 'auto' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Novo Curso</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <input
                type="text"
                placeholder="Título do curso"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
              <textarea
                placeholder="Descrição do curso"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
                required
              >
                <option value="">Selecionar categoria</option>
                <option value="Programação">Programação</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Mobile">Mobile</option>
                <option value="Design">Design</option>
              </select>
              <select 
                value={formData.instructor_id}
                onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
                required
              >
                <option value="">Selecionar instrutor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.full_name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Carga horária"
                value={formData.duration_hours || ''}
                onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
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

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Editar Curso</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <input
                type="text"
                placeholder="Título do curso"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
              <textarea
                placeholder="Descrição do curso"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
                required
              >
                <option value="">Selecionar categoria</option>
                <option value="Programação">Programação</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Mobile">Mobile</option>
                <option value="Design">Design</option>
              </select>
              <select 
                value={formData.instructor_id}
                onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
                required
              >
                <option value="">Selecionar instrutor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.full_name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Carga horária"
                value={formData.duration_hours || ''}
                onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
                required
              />
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

      {/* Course Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedCourse.title}</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="relative z-50 cursor-pointer text-slate-300 text-2xl font-bold hover:text-white"
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-slate-300"><strong className="text-white">Categoria:</strong> {selectedCourse.category}</p>
                  <p className="text-slate-300"><strong className="text-white">Instrutor:</strong> {selectedCourse.instructor?.full_name}</p>
                  <p className="text-slate-300"><strong className="text-white">Carga Horária:</strong> {selectedCourse.duration_hours}h</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300"><strong className="text-white">Preço:</strong> R$ {selectedCourse.price}</p>
                  <p className="text-slate-300"><strong className="text-white">Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCourse.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedCourse.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </p>
                  <p className="text-slate-300"><strong className="text-white">Matrículas:</strong> {selectedCourse.enrollment_count || 0}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Descrição</h4>
                <p className="text-slate-300 leading-relaxed">{selectedCourse.description}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Informações do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300">
                  <p><strong className="text-white">Criado em:</strong> {new Date(selectedCourse.created_at).toLocaleDateString('pt-BR')}</p>
                  <p><strong className="text-white">Atualizado em:</strong> {new Date(selectedCourse.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="relative z-50 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all"
                style={{ pointerEvents: 'auto' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}