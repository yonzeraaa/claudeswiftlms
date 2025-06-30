'use client'

import { useState } from 'react'

export default function CoursesContent() {
  const [showModal, setShowModal] = useState(false)
  // const [selectedCourse, setSelectedCourse] = useState<null>(null)

  const courses = [
    { id: 1, title: 'JavaScript Fundamentals', category: 'Programação', students: 89, status: 'active', progress: 92, instructor: 'Maria Oliveira' },
    { id: 2, title: 'React para Iniciantes', category: 'Frontend', students: 76, status: 'active', progress: 85, instructor: 'João Silva' },
    { id: 3, title: 'Node.js Backend', category: 'Backend', students: 54, status: 'active', progress: 78, instructor: 'Ana Santos' },
    { id: 4, title: 'Python Básico', category: 'Programação', students: 43, status: 'draft', progress: 0, instructor: 'Carlos Lima' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-semibold font-montserrat">Gestão de Cursos</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          + Novo Curso
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Total de Cursos</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">12</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Cursos Ativos</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">9</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Em Desenvolvimento</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">3</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Total de Alunos</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">262</p>
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
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">Instrutor: {course.instructor}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.status === 'active' ? 'Ativo' : 'Rascunho'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#2C1A0E] font-semibold font-medium">Progresso</span>
                <span className="text-[#2C1A0E] font-semibold font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: `${course.progress}%`}}></div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-[#2C1A0E] font-semibold font-medium text-sm">👥 {course.students} alunos</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => console.log('Edit course:', course.id)}
                className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all text-sm"
              >
                Editar
              </button>
              <button className="px-4 py-2 border-2 border-[#D2B48C] text-[#2C1A0E] font-semibold font-medium rounded-lg hover:bg-[#FFD700]/20 transition-colors text-sm">
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
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Título do curso"
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
              <textarea
                placeholder="Descrição do curso"
                rows={3}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
              <select className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
                <option>Selecionar categoria</option>
                <option>Programação</option>
                <option>Frontend</option>
                <option>Backend</option>
                <option>Mobile</option>
                <option>Design</option>
              </select>
              <select className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
                <option>Selecionar instrutor</option>
                <option>Maria Oliveira</option>
                <option>João Silva</option>
                <option>Ana Santos</option>
                <option>Carlos Lima</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Carga horária"
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
                <input
                  type="number"
                  placeholder="Preço (R$)"
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}