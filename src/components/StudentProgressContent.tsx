'use client'

export default function StudentProgressContent() {
  const progressData = [
    { month: 'Set', completed: 2, hours: 24 },
    { month: 'Out', completed: 3, hours: 36 },
    { month: 'Nov', completed: 4, hours: 48 },
    { month: 'Dez', completed: 6, hours: 58 },
  ]

  const grades = [
    { course: 'JavaScript Avançado', assignments: [{ name: 'Quiz 1', grade: 9.5 }, { name: 'Projeto', grade: 8.8 }], average: 9.2 },
    { course: 'React Fundamentals', assignments: [{ name: 'Quiz 1', grade: 8.0 }, { name: 'Exercícios', grade: 9.0 }], average: 8.5 },
    { course: 'Node.js Backend', assignments: [{ name: 'API Project', grade: 9.8 }], average: 9.8 },
    { course: 'Python Básico', assignments: [{ name: 'Final', grade: 10.0 }], average: 10.0 },
  ]

  const certificates = [
    { name: 'Python Básico', date: '15/12/2024', id: 'CERT-001' },
    { name: 'HTML & CSS', date: '20/11/2024', id: 'CERT-002' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#2C1A0E] mb-6 font-montserrat">Meu Progresso</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-[#2C1A0E] font-bold">📚</span>
            </div>
            <p className="text-2xl font-bold text-[#2C1A0E]">15</p>
            <p className="text-[#3D2914] font-semibold text-sm">Aulas Concluídas</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-[#2C1A0E] font-bold">⏱️</span>
            </div>
            <p className="text-2xl font-bold text-[#2C1A0E]">166h</p>
            <p className="text-[#3D2914] font-semibold text-sm">Horas de Estudo</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-[#2C1A0E] font-bold">🎯</span>
            </div>
            <p className="text-2xl font-bold text-[#2C1A0E]">9.1</p>
            <p className="text-[#3D2914] font-semibold text-sm">Média Geral</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-[#2C1A0E] font-bold">🏆</span>
            </div>
            <p className="text-2xl font-bold text-[#2C1A0E]">2</p>
            <p className="text-[#3D2914] font-semibold text-sm">Certificados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progress Chart */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Progresso Mensal</h2>
          <div className="h-64 flex items-end justify-between space-x-4">
            {progressData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#FFD700]/20 rounded-t-lg relative" style={{height: `${data.completed * 30}px`}}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#FFD700] to-[#B8860B] rounded-t-lg" style={{height: `${data.completed * 25}px`}}></div>
                </div>
                <p className="text-[#3D2914] font-medium text-sm mt-2">{data.month}</p>
                <p className="text-[#2C1A0E] font-bold text-xs">{data.completed} aulas</p>
                <p className="text-[#3D2914] font-medium text-xs">{data.hours}h</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Metas & Objetivos</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#2C1A0E] font-semibold">Concluir JavaScript Avançado</p>
                <span className="text-[#3D2914] font-bold text-sm">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-[#3D2914] font-medium text-sm mt-1">6 aulas restantes</p>
            </div>

            <div className="p-4 bg-white/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#2C1A0E] font-semibold">Estudar 20h por mês</p>
                <span className="text-[#3D2914] font-bold text-sm">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-2 rounded-full" style={{width: '90%'}}></div>
              </div>
              <p className="text-[#3D2914] font-medium text-sm mt-1">18h de 20h concluídas</p>
            </div>

            <div className="p-4 bg-white/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#2C1A0E] font-semibold">Manter média acima de 9.0</p>
                <span className="text-green-600 font-bold text-sm">✓</span>
              </div>
              <p className="text-[#3D2914] font-medium text-sm">Média atual: 9.1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Histórico de Notas</h2>
          <div className="space-y-4">
            {grades.map((course, index) => (
              <div key={index} className="p-4 bg-white/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[#2C1A0E] font-semibold">{course.course}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    course.average >= 9 ? 'bg-green-100 text-green-700' :
                    course.average >= 7 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Média: {course.average}
                  </span>
                </div>
                <div className="space-y-1">
                  {course.assignments.map((assignment, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-[#3D2914] font-medium">{assignment.name}</span>
                      <span className="text-[#2C1A0E] font-bold">{assignment.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h2 className="text-xl font-bold text-[#2C1A0E] mb-4 font-montserrat">Certificados Conquistados</h2>
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <div key={index} className="p-4 bg-white/50 rounded-lg border-l-4 border-[#FFD700]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2C1A0E] font-semibold">{cert.name}</p>
                    <p className="text-[#3D2914] font-medium text-sm">Emitido em {cert.date}</p>
                    <p className="text-[#3D2914] font-medium text-xs">ID: {cert.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gradient-to-r from-[#8B4513] to-[#654321] text-white text-xs font-semibold rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all duration-300">
                      Download
                    </button>
                    <button className="px-3 py-1 bg-white/50 hover:bg-white/70 text-[#2C1A0E] text-xs font-semibold rounded-lg transition-colors duration-200">
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[#FFD700]/10 rounded-lg border-2 border-dashed border-[#FFD700]/30">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🎯</span>
              <p className="text-[#2C1A0E] font-semibold">Próximo Certificado</p>
              <p className="text-[#3D2914] font-medium text-sm">JavaScript Avançado - 25% restante</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}