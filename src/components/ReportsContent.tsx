'use client'

import { useState } from 'react'

export default function ReportsContent() {
  const [activeTab, setActiveTab] = useState('students')
  const [dateRange, setDateRange] = useState('month')

  const studentReports = [
    { name: 'Ana Silva', courses: 3, completed: 2, progress: 85, avgScore: 9.2, lastActivity: '2024-01-15' },
    { name: 'Carlos Santos', courses: 2, completed: 1, progress: 60, avgScore: 7.8, lastActivity: '2024-01-14' },
    { name: 'Maria Oliveira', courses: 4, completed: 3, progress: 92, avgScore: 8.9, lastActivity: '2024-01-16' },
  ]

  const courseReports = [
    { course: 'JavaScript Fundamentals', students: 89, completed: 67, avgScore: 8.2, engagement: 94 },
    { course: 'React para Iniciantes', students: 76, completed: 52, avgScore: 7.8, engagement: 87 },
    { course: 'Node.js Backend', students: 54, completed: 38, avgScore: 8.5, engagement: 91 },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white font-semibold font-montserrat">Relatórios & Analytics</h1>
        <div className="flex space-x-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>
          <button className="relative z-50 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-700 text-white px-4 py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all" style={{ pointerEvents: 'auto' }}>
            📊 Exportar
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Taxa de Retenção</h3>
          <p className="text-2xl font-bold text-white">92%</p>
          <p className="text-green-400 text-xs">+5% vs período anterior</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">Tempo Médio por Sessão</h3>
          <p className="text-2xl font-bold text-white">45min</p>
          <p className="text-sky-400 text-xs">+8min vs período anterior</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">NPS Score</h3>
          <p className="text-2xl font-bold text-white">8.7</p>
          <p className="text-green-400 text-xs">Excelente satisfação</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-slate-300 font-medium text-sm">ROI do Curso</h3>
          <p className="text-2xl font-bold text-white">340%</p>
          <p className="text-green-400 text-xs">Acima da meta</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30 mb-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('students')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'students' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Relatório de Alunos
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'courses' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Performance de Cursos
          </button>
          <button 
            onClick={() => setActiveTab('engagement')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'engagement' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Engajamento
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'financial' 
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-slate-900 font-semibold' 
                : 'text-white font-medium hover:bg-sky-400/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            Financeiro
          </button>
        </div>
      </div>

      {/* Students Report Tab */}
      {activeTab === 'students' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Relatório Detalhado de Alunos</h3>
            <button className="relative z-50 cursor-pointer text-slate-300 hover:text-white" style={{ pointerEvents: 'auto' }}>📄 Exportar CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-600">
                  <th className="text-left p-3 text-white font-semibold">Aluno</th>
                  <th className="text-left p-3 text-white font-semibold">Cursos</th>
                  <th className="text-left p-3 text-white font-semibold">Concluídos</th>
                  <th className="text-left p-3 text-white font-semibold">Progresso</th>
                  <th className="text-left p-3 text-white font-semibold">Nota Média</th>
                  <th className="text-left p-3 text-white font-semibold">Última Atividade</th>
                  <th className="text-left p-3 text-white font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentReports.map((student, index) => (
                  <tr key={index} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                    <td className="p-3 text-slate-300 font-medium">{student.name}</td>
                    <td className="p-3 text-slate-300 font-medium">{student.courses}</td>
                    <td className="p-3 text-slate-300 font-medium">{student.completed}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
                          <div className="bg-gradient-to-r from-sky-400 to-sky-500 h-2 rounded-full" style={{width: `${student.progress}%`}}></div>
                        </div>
                        <span className="text-slate-300 text-sm font-medium">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-medium">{student.avgScore}</td>
                    <td className="p-3 text-slate-300 font-medium">{student.lastActivity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.progress > 80 ? 'bg-green-100 text-green-800' : 
                        student.progress > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.progress > 80 ? 'Excelente' : student.progress > 50 ? 'Bom' : 'Precisa Atenção'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Performance Tab */}
      {activeTab === 'courses' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-lg font-bold text-white mb-4">Performance dos Cursos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courseReports.map((course, index) => (
              <div key={index} className="p-4 bg-slate-800/80 rounded-lg">
                <h4 className="text-white font-medium mb-3">{course.course}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium text-sm">Alunos Matriculados</span>
                    <span className="text-slate-300 font-medium">{course.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium text-sm">Concluíram</span>
                    <span className="text-slate-300 font-medium">{course.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium text-sm">Taxa de Conclusão</span>
                    <span className="text-slate-300 font-medium">{Math.round((course.completed / course.students) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium text-sm">Nota Média</span>
                    <span className="text-slate-300 font-medium">{course.avgScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium text-sm">Engajamento</span>
                    <span className="text-slate-300 font-medium">{course.engagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-lg font-bold text-white mb-4">Análise de Engajamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-3">Horários de Maior Atividade</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">08:00 - 12:00</span>
                  <span className="text-slate-300 font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">13:00 - 17:00</span>
                  <span className="text-slate-300 font-medium">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">18:00 - 22:00</span>
                  <span className="text-slate-300 font-medium">25%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-3">Dispositivos Mais Utilizados</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Desktop</span>
                  <span className="text-slate-300 font-medium">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Mobile</span>
                  <span className="text-slate-300 font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Tablet</span>
                  <span className="text-slate-300 font-medium">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
          <h3 className="text-lg font-bold text-white mb-4">Relatório Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-3">Receita por Período</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Janeiro</span>
                  <span className="text-slate-300 font-medium">R$ 42.5k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Fevereiro</span>
                  <span className="text-slate-300 font-medium">R$ 38.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Março</span>
                  <span className="text-slate-300 font-medium">R$ 45.8k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Abril</span>
                  <span className="text-slate-300 font-medium">R$ 51.2k</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-3">Cursos Mais Rentáveis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">JavaScript Fund.</span>
                  <span className="text-slate-300 font-medium">R$ 18.5k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">React Iniciantes</span>
                  <span className="text-slate-300 font-medium">R$ 15.2k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Node.js Backend</span>
                  <span className="text-slate-300 font-medium">R$ 12.8k</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-lg">
              <h4 className="text-white font-medium mb-3">Métrica de Crescimento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">MRR</span>
                  <span className="text-green-400 font-medium">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">CAC</span>
                  <span className="text-slate-300 font-medium">R$ 85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">LTV</span>
                  <span className="text-slate-300 font-medium">R$ 450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium text-sm">Churn Rate</span>
                  <span className="text-red-400 font-medium">3.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}