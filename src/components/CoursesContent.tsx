'use client'

import { useState, useEffect } from 'react'
import { getAllCourses, getCourseStats, createCourse, updateCourse, getCourseById, getInstructors, Course, CourseStats } from '@/lib/courses'

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
    duration_hours: 0,
    price: 0
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
      const [coursesData, statsData, instructorsData] = await Promise.all([
        getAllCourses(),
        getCourseStats(), 
        getInstructors()
      ])
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
        price: 0
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
      price: course.price
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
        price: 0
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-semibold font-montserrat">Gestão de Cursos</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="relative z-50 cursor-pointer bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
          style={{ pointerEvents: 'auto' }}
        >
          + Novo Curso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Total de Cursos</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">{stats?.totalCourses || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Cursos Ativos</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">{stats?.activeCourses || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Em Desenvolvimento</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">{stats?.draftCourses || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Total de Matrículas</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">{stats?.totalEnrollments || 0}</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-2">{course.title}</h3>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm mb-2">Categoria: {course.category}</p>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">Instrutor: {course.instructor?.full_name || 'N/A'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.status === 'published' ? 'Publicado' : 'Rascunho'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#2C1A0E] font-semibold font-medium">Matrículas</span>
                <span className="text-[#2C1A0E] font-semibold font-medium">{course.enrollment_count || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: `${Math.min(100, (course.enrollment_count || 0) * 2)}%`}}></div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-[#2C1A0E] font-semibold font-medium text-sm">📅 {course.duration_hours}h</span>
                <span className="text-[#2C1A0E] font-semibold font-medium text-sm ml-4">💰 R$ {course.price}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditCourse(course)}
                className="relative z-50 cursor-pointer flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all text-sm"
                style={{ pointerEvents: 'auto' }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleViewCourse(course.id)}
                className="relative z-50 cursor-pointer px-4 py-2 border-2 border-[#D2B48C] text-[#2C1A0E] font-semibold font-medium rounded-lg hover:bg-[#FFD700]/20 transition-colors text-sm"
                style={{ pointerEvents: 'auto' }}
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-[#2C1A0E] font-semibold mb-4">Novo Curso</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <input
                type="text"
                placeholder="Título do curso"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              />
              <textarea
                placeholder="Descrição do curso"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              />
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
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
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              >
                <option value="">Selecionar instrutor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.full_name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Carga horária"
                  value={formData.duration_hours || ''}
                  onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  required
                />
                <input
                  type="number"
                  placeholder="Preço (R$)"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all disabled:opacity-50"
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
          <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-[#2C1A0E] font-semibold mb-4">Editar Curso</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <input
                type="text"
                placeholder="Título do curso"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              />
              <textarea
                placeholder="Descrição do curso"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              />
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
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
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                required
              >
                <option value="">Selecionar instrutor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.full_name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Carga horária"
                  value={formData.duration_hours || ''}
                  onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  required
                />
                <input
                  type="number"
                  placeholder="Preço (R$)"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all disabled:opacity-50"
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
          <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-[#2C1A0E] font-semibold">{selectedCourse.title}</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="relative z-50 cursor-pointer text-[#2C1A0E] text-2xl font-bold hover:text-[#8B4513]"
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[#2C1A0E] font-semibold"><strong>Categoria:</strong> {selectedCourse.category}</p>
                  <p className="text-[#2C1A0E] font-semibold"><strong>Instrutor:</strong> {selectedCourse.instructor?.full_name}</p>
                  <p className="text-[#2C1A0E] font-semibold"><strong>Carga Horária:</strong> {selectedCourse.duration_hours}h</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[#2C1A0E] font-semibold"><strong>Preço:</strong> R$ {selectedCourse.price}</p>
                  <p className="text-[#2C1A0E] font-semibold"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCourse.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedCourse.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </p>
                  <p className="text-[#2C1A0E] font-semibold"><strong>Matrículas:</strong> {selectedCourse.enrollment_count || 0}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-2">Descrição</h4>
                <p className="text-[#2C1A0E] font-semibold leading-relaxed">{selectedCourse.description}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-2">Informações do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#2C1A0E] font-semibold">
                  <p><strong>Criado em:</strong> {new Date(selectedCourse.created_at).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Atualizado em:</strong> {new Date(selectedCourse.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="relative z-50 cursor-pointer bg-gradient-to-r from-[#8B4513] to-[#654321] text-white px-6 py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all"
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