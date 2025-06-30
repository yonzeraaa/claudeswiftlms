'use client'

export default function DashboardContent() {
  const chartData = [
    { month: 'Jan', students: 180, completion: 75 },
    { month: 'Fev', students: 200, completion: 82 },
    { month: 'Mar', students: 220, completion: 78 },
    { month: 'Abr', students: 248, completion: 87 },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#2C1A0E] mb-6 font-montserrat">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Total de Alunos</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">248</p>
              <p className="text-green-600 text-xs">+12% este mês</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">👥</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Cursos Ativos</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">12</p>
              <p className="text-blue-600 text-xs">2 novos cursos</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">📚</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">87%</p>
              <p className="text-green-600 text-xs">+5% vs mês anterior</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">📈</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#3D2914] text-sm font-semibold">Receita Mensal</p>
              <p className="text-2xl font-bold text-[#2C1A0E]">R$ 45.2k</p>
              <p className="text-green-600 text-xs">+18% crescimento</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center">
              <span className="text-[#3D2914] font-bold">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Chart */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Engajamento dos Alunos</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#FFD700]/20 rounded-t-lg relative" style={{height: `${data.completion * 2}px`}}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#FFD700] to-[#B8860B] rounded-t-lg" style={{height: `${data.completion * 1.5}px`}}></div>
                </div>
                <p className="text-[#3D2914] text-sm mt-2 font-medium">{data.month}</p>
                <p className="text-[#2C1A0E] text-xs font-semibold">{data.completion}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Cursos Mais Populares</h2>
          <div className="space-y-4">
            {[
              { name: 'JavaScript Fundamentals', students: 89, progress: 92 },
              { name: 'React para Iniciantes', students: 76, progress: 85 },
              { name: 'Node.js Backend', students: 54, progress: 78 },
              { name: 'Python Básico', students: 43, progress: 90 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-[#2C1A0E] font-semibold">{course.name}</p>
                  <p className="text-[#3D2914] text-sm font-medium">{course.students} alunos matriculados</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: `${course.progress}%`}}></div>
                  </div>
                </div>
                <span className="text-[#2C1A0E] font-bold ml-4">{course.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
        <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Atividade Recente</h2>
        <div className="space-y-4">
          {[
            { type: 'completion', user: 'Ana Silva', action: 'concluiu "Introdução ao JavaScript"', time: 'há 2 horas', color: 'green' },
            { type: 'course', user: 'Sistema', action: 'Novo curso "React Avançado" foi adicionado', time: 'há 4 horas', color: 'blue' },
            { type: 'signup', user: 'Sistema', action: '3 novos usuários se cadastraram', time: 'hoje', color: 'orange' },
            { type: 'assessment', user: 'Carlos Santos', action: 'completou avaliação "Python Básico"', time: 'há 1 dia', color: 'purple' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center mr-3`}>
                  <span className={`text-${activity.color}-600 text-sm`}>
                    {activity.type === 'completion' ? '✓' : activity.type === 'course' ? '📚' : activity.type === 'signup' ? '👤' : '📝'}
                  </span>
                </div>
                <div>
                  <p className="text-[#2C1A0E] font-semibold">{activity.user} {activity.action}</p>
                  <p className="text-[#3D2914] text-sm font-medium">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}