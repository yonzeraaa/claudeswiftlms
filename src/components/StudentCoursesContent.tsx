'use client'

import { useState } from 'react'

export default function StudentCoursesContent() {
  const [filter, setFilter] = useState('all')

  const courses = [
    {
      id: 1,
      title: 'JavaScript Avançado',
      instructor: 'Prof. Maria Silva',
      progress: 75,
      status: 'active',
      totalLessons: 24,
      completedLessons: 18,
      nextLesson: 'Promises e Async/Await',
      category: 'Programação',
      thumbnail: '🟨'
    },
    {
      id: 2,
      title: 'React Fundamentals',
      instructor: 'Prof. João Santos',
      progress: 45,
      status: 'active',
      totalLessons: 20,
      completedLessons: 9,
      nextLesson: 'useState Hook',
      category: 'Frontend',
      thumbnail: '🔵'
    },
    {
      id: 3,
      title: 'Node.js Backend',
      instructor: 'Prof. Ana Costa',
      progress: 30,
      status: 'active',
      totalLessons: 16,
      completedLessons: 5,
      nextLesson: 'Express Routes',
      category: 'Backend',
      thumbnail: '🟢'
    },
    {
      id: 4,
      title: 'Python Básico',
      instructor: 'Prof. Carlos Lima',
      progress: 100,
      status: 'completed',
      totalLessons: 12,
      completedLessons: 12,
      nextLesson: 'Curso Concluído',
      category: 'Programação',
      thumbnail: '🐍'
    }
  ]

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    if (filter === 'active') return course.status === 'active'
    if (filter === 'completed') return course.status === 'completed'
    return true
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-montserrat">Meus Cursos</h1>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'Todos', count: courses.length },
            { id: 'active', label: 'Ativos', count: courses.filter(c => c.status === 'active').length },
            { id: 'completed', label: 'Concluídos', count: courses.filter(c => c.status === 'completed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold'
                  : 'bg-white/50 text-[#3D2914] hover:bg-white/70 font-medium'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">{course.thumbnail}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C1A0E] font-montserrat">{course.title}</h3>
                  <p className="text-[#3D2914] font-medium text-sm">{course.instructor}</p>
                  <p className="text-[#3D2914] font-medium text-xs">{course.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                course.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {course.status === 'completed' ? 'Concluído' : 'Em Progresso'}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#3D2914] font-medium text-sm">Progresso</span>
                <span className="text-[#2C1A0E] font-bold text-sm">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full transition-all duration-300" 
                  style={{width: `${course.progress}%`}}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[#3D2914] font-medium text-xs">
                  {course.completedLessons}/{course.totalLessons} aulas
                </span>
              </div>
            </div>

            {/* Next Lesson */}
            <div className="mb-4">
              <p className="text-[#3D2914] font-semibold text-sm mb-1">
                {course.status === 'completed' ? 'Status:' : 'Próxima aula:'}
              </p>
              <p className="text-[#2C1A0E] font-semibold">{course.nextLesson}</p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                {course.status === 'completed' ? 'Revisar' : 'Continuar'}
              </button>
              <button className="px-4 py-2 bg-white/50 hover:bg-white/70 text-[#2C1A0E] font-semibold rounded-lg transition-colors duration-200 text-sm">
                Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-white/50 hover:bg-white/70 rounded-lg transition-colors duration-200">
            <span className="mr-2">🔍</span>
            <span className="text-[#2C1A0E] font-semibold">Explorar Cursos</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white/50 hover:bg-white/70 rounded-lg transition-colors duration-200">
            <span className="mr-2">📋</span>
            <span className="text-[#2C1A0E] font-semibold">Minhas Notas</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white/50 hover:bg-white/70 rounded-lg transition-colors duration-200">
            <span className="mr-2">🏆</span>
            <span className="text-[#2C1A0E] font-semibold">Certificados</span>
          </button>
        </div>
      </div>
    </div>
  )
}