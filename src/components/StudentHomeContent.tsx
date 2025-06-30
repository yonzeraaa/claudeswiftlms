'use client'

export default function StudentHomeContent() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] mb-2 font-montserrat">Bem-vindo, João!</h1>
        <p className="text-[#3D2914] font-medium">Continue seus estudos e alcance seus objetivos</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Cursos Ativos</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">4</p>
              <p className="text-green-600 text-xs">2 em progresso</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#2C1A0E] font-bold">📚</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Progresso Geral</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">68%</p>
              <p className="text-blue-600 text-xs">+12% este mês</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#2C1A0E] font-bold">📊</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Certificados</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">2</p>
              <p className="text-green-600 text-xs">1 próximo</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#2C1A0E] font-bold">🏆</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Continue Aprendendo</h2>
          <div className="space-y-4">
            {[
              { course: 'JavaScript Avançado', progress: 75, lesson: 'Promises e Async/Await' },
              { course: 'React Fundamentals', progress: 45, lesson: 'useState Hook' },
              { course: 'Node.js Backend', progress: 30, lesson: 'Express Routes' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors duration-200 cursor-pointer">
                <div className="flex-1">
                  <p className="text-[#2C1A0E] font-semibold">{item.course}</p>
                  <p className="text-[#3D2914] font-medium text-sm">{item.lesson}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: `${item.progress}%`}}></div>
                  </div>
                </div>
                <span className="text-[#2C1A0E] font-bold ml-4">{item.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Próximas Atividades</h2>
          <div className="space-y-4">
            {[
              { type: 'quiz', title: 'Quiz: JavaScript ES6', due: 'Hoje, 18:00', color: 'orange' },
              { type: 'assignment', title: 'Projeto React - ToDo App', due: 'Amanhã, 23:59', color: 'blue' },
              { type: 'live', title: 'Aula ao Vivo: Node.js', due: '15/01, 19:00', color: 'green' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center mr-3`}>
                    <span className={`text-${activity.color}-600 text-sm`}>
                      {activity.type === 'quiz' ? '📝' : activity.type === 'assignment' ? '📋' : '🎥'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#2C1A0E] font-semibold">{activity.title}</p>
                    <p className="text-[#3D2914] font-medium text-sm">{activity.due}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}