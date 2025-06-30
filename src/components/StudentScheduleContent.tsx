'use client'

import { useState } from 'react'

export default function StudentScheduleContent() {
  const [view, setView] = useState('week')

  const events = [
    {
      id: 1,
      title: 'Aula ao Vivo: JavaScript ES6',
      type: 'live',
      date: '2024-01-15',
      time: '19:00',
      duration: '1h 30min',
      instructor: 'Prof. Maria Silva',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Entrega: Projeto React',
      type: 'assignment',
      date: '2024-01-16',
      time: '23:59',
      duration: 'Prazo final',
      course: 'React Fundamentals',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Quiz: Node.js Basics',
      type: 'quiz',
      date: '2024-01-17',
      time: '18:00',
      duration: '45min',
      course: 'Node.js Backend',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Webinar: Carreira em Tech',
      type: 'webinar',
      date: '2024-01-18',
      time: '20:00',
      duration: '2h',
      instructor: 'Palestrante Convidado',
      status: 'optional'
    }
  ]

  const tasks = [
    {
      id: 1,
      title: 'Assistir: Aula 18 - Promises',
      course: 'JavaScript Avançado',
      priority: 'high',
      dueDate: 'Hoje',
      completed: false
    },
    {
      id: 2,
      title: 'Fazer exercícios de React Hooks',
      course: 'React Fundamentals',
      priority: 'medium',
      dueDate: 'Amanhã',
      completed: false
    },
    {
      id: 3,
      title: 'Revisar notas da aula de APIs',
      course: 'Node.js Backend',
      priority: 'low',
      dueDate: '2 dias',
      completed: true
    },
    {
      id: 4,
      title: 'Preparar apresentação final',
      course: 'JavaScript Avançado',
      priority: 'high',
      dueDate: '3 dias',
      completed: false
    }
  ]

  const upcomingEvents = events.filter(event => event.status !== 'completed').slice(0, 3)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-montserrat">Agenda & Tarefas</h1>
        
        {/* View Toggle */}
        <div className="flex space-x-2">
          {[
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mês' }
          ].map(viewOption => (
            <button
              key={viewOption.id}
              onClick={() => setView(viewOption.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                view === viewOption.id
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold'
                  : 'bg-white/50 text-[#3D2914] hover:bg-white/70 font-medium'
              }`}
            >
              {viewOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Overview */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-lg font-bold text-[#2C1A0E] mb-4 font-montserrat flex items-center">
            <span className="mr-2">📅</span>
            Hoje
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-[#2C1A0E] font-semibold text-sm">Aula: JavaScript ES6</p>
              <p className="text-[#3D2914] font-medium text-xs">19:00 - 20:30</p>
            </div>
            <div className="p-3 bg-white/50 rounded-lg">
              <p className="text-[#2C1A0E] font-semibold text-sm">Revisar: React Hooks</p>
              <p className="text-[#3D2914] font-medium text-xs">Tarefa pendente</p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-lg font-bold text-[#2C1A0E] mb-4 font-montserrat flex items-center">
            <span className="mr-2">📋</span>
            Esta Semana
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#3D2914] font-medium text-sm">Aulas ao vivo</span>
              <span className="text-[#2C1A0E] font-bold text-sm">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3D2914] font-medium text-sm">Tarefas</span>
              <span className="text-[#2C1A0E] font-bold text-sm">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3D2914] font-medium text-sm">Quizzes</span>
              <span className="text-[#2C1A0E] font-bold text-sm">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#3D2914] font-medium text-sm">Prazos</span>
              <span className="text-red-600 font-bold text-sm">3</span>
            </div>
          </div>
        </div>

        {/* Study Time */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-lg font-bold text-[#2C1A0E] mb-4 font-montserrat flex items-center">
            <span className="mr-2">⏱️</span>
            Tempo de Estudo
          </h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#2C1A0E]">4h 30min</p>
            <p className="text-[#3D2914] font-medium text-sm">Esta semana</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <p className="text-[#3D2914] font-medium text-xs mt-1">Meta: 6h/semana</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Próximos Eventos</h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-4 bg-white/50 rounded-lg border-l-4 border-[#FFD700]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">
                        {event.type === 'live' ? '🎥' : 
                         event.type === 'assignment' ? '📋' : 
                         event.type === 'quiz' ? '📝' : '🌐'}
                      </span>
                      <p className="text-[#2C1A0E] font-semibold">{event.title}</p>
                    </div>
                    <p className="text-[#3D2914] font-medium text-sm">{event.date} às {event.time}</p>
                    <p className="text-[#3D2914] font-medium text-xs">{event.duration}</p>
                    {event.instructor && (
                      <p className="text-[#3D2914] font-medium text-xs">{event.instructor}</p>
                    )}
                    {event.course && (
                      <p className="text-[#3D2914] font-medium text-xs">{event.course}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    event.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {event.status === 'upcoming' ? 'Em breve' :
                     event.status === 'pending' ? 'Pendente' : 'Opcional'}
                  </span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white text-xs font-semibold rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all duration-300">
                    {event.type === 'live' ? 'Entrar' : event.type === 'assignment' ? 'Enviar' : 'Fazer'}
                  </button>
                  <button className="px-3 py-1 bg-white/50 hover:bg-white/70 text-[#2C1A0E] text-xs font-semibold rounded-lg transition-colors duration-200">
                    Lembrete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Reminders */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Tarefas Pendentes</h2>
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <div key={task.id} className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <input 
                      type="checkbox" 
                      className="mt-1 mr-3 w-4 h-4 text-[#FFD700] bg-gray-100 border-gray-300 rounded focus:ring-[#FFD700]"
                    />
                    <div className="flex-1">
                      <p className="text-[#2C1A0E] font-semibold">{task.title}</p>
                      <p className="text-[#3D2914] font-medium text-sm">{task.course}</p>
                      <p className="text-[#3D2914] font-medium text-xs">Prazo: {task.dueDate}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority === 'high' ? 'Alta' :
                     task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center p-3 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white font-semibold rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all duration-300 text-sm">
              <span className="mr-2">➕</span>
              Nova Tarefa
            </button>
            <button className="flex items-center justify-center p-3 bg-white/50 hover:bg-white/70 text-[#2C1A0E] font-semibold rounded-lg transition-colors duration-200 text-sm">
              <span className="mr-2">📊</span>
              Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}