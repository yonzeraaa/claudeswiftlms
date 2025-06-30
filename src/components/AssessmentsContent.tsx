'use client'

import { useState } from 'react'

export default function AssessmentsContent() {
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('assessments')

  const assessments = [
    { id: 1, title: 'JavaScript Quiz', course: 'JavaScript Fundamentals', type: 'quiz', questions: 20, submissions: 45, avgScore: 8.2, status: 'active' },
    { id: 2, title: 'React Final Exam', course: 'React para Iniciantes', type: 'exam', questions: 35, submissions: 32, avgScore: 7.8, status: 'active' },
    { id: 3, title: 'Node.js Project', course: 'Node.js Backend', type: 'project', questions: 5, submissions: 18, avgScore: 9.1, status: 'active' },
    { id: 4, title: 'Python Practice', course: 'Python Básico', type: 'quiz', questions: 15, submissions: 0, avgScore: 0, status: 'draft' },
  ]

  const questions = [
    { id: 1, question: 'O que é JavaScript?', type: 'multiple', options: 4, difficulty: 'easy', category: 'Conceitos Básicos' },
    { id: 2, question: 'Explique closures em JavaScript', type: 'essay', options: 0, difficulty: 'hard', category: 'Avançado' },
    { id: 3, question: 'Qual é a diferença entre let e var?', type: 'multiple', options: 4, difficulty: 'medium', category: 'Variáveis' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-semibold font-montserrat">Sistema de Avaliações</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          + Nova Avaliação
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Total de Avaliações</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">24</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Pendentes de Correção</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">15</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Média Geral</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">8.4</p>
        </div>
        <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-[#2C1A0E] font-semibold font-medium text-sm font-medium">Taxa de Aprovação</h3>
          <p className="text-2xl font-bold text-[#2C1A0E] font-semibold">89%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30 mb-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'assessments' 
                ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold' 
                : 'text-[#2C1A0E] font-semibold font-medium hover:bg-[#FFD700]/20'
            }`}
          >
            Avaliações
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'questions' 
                ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold' 
                : 'text-[#2C1A0E] font-semibold font-medium hover:bg-[#FFD700]/20'
            }`}
          >
            Banco de Questões
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'results' 
                ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold' 
                : 'text-[#2C1A0E] font-semibold font-medium hover:bg-[#FFD700]/20'
            }`}
          >
            Resultados
          </button>
        </div>
      </div>

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#D2B48C]">
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Título</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Curso</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Tipo</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Questões</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Submissões</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Média</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Status</th>
                  <th className="text-left p-3 text-[#2C1A0E] font-semibold font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-[#D2B48C]/30 hover:bg-white/50">
                    <td className="p-3 text-[#2C1A0E] font-semibold font-medium">{assessment.title}</td>
                    <td className="p-3 text-[#2C1A0E] font-semibold font-medium">{assessment.course}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 
                        assessment.type === 'exam' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {assessment.type === 'quiz' ? 'Quiz' : assessment.type === 'exam' ? 'Prova' : 'Projeto'}
                      </span>
                    </td>
                    <td className="p-3 text-[#2C1A0E] font-semibold">{assessment.questions}</td>
                    <td className="p-3 text-[#2C1A0E] font-semibold">{assessment.submissions}</td>
                    <td className="p-3 text-[#2C1A0E] font-semibold font-medium">{assessment.avgScore.toFixed(1)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Ver Resultados</button>
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
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold">Banco de Questões</h3>
            <button className="bg-gradient-to-r from-[#8B4513] to-[#654321] text-white px-4 py-2 rounded-lg text-sm">
              + Nova Questão
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="p-4 bg-white/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[#2C1A0E] font-semibold font-medium flex-1">{question.question}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.type === 'multiple' ? 'Múltipla Escolha' : 'Dissertativa'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-[#2C1A0E] font-semibold font-medium">
                  <span>Categoria: {question.category}</span>
                  {question.type === 'multiple' && <span>{question.options} opções</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Relatório de Desempenho</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Distribuição de Notas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#2C1A0E] font-semibold font-medium text-sm">9.0 - 10.0</span>
                  <span className="text-[#2C1A0E] font-semibold font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A0E] font-semibold font-medium text-sm">8.0 - 8.9</span>
                  <span className="text-[#2C1A0E] font-semibold font-medium">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A0E] font-semibold font-medium text-sm">7.0 - 7.9</span>
                  <span className="text-[#2C1A0E] font-semibold font-medium">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A0E] font-semibold font-medium text-sm">&lt; 7.0</span>
                  <span className="text-[#2C1A0E] font-semibold font-medium">15%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Questões mais Difíceis</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="text-[#2C1A0E] font-semibold font-medium">Closures em JavaScript</p>
                  <p className="text-[#2C1A0E] font-semibold font-medium">Taxa de acerto: 45%</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#2C1A0E] font-semibold font-medium">Async/Await vs Promises</p>
                  <p className="text-[#2C1A0E] font-semibold font-medium">Taxa de acerto: 52%</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#2C1A0E] font-semibold font-medium">Event Loop</p>
                  <p className="text-[#2C1A0E] font-semibold font-medium">Taxa de acerto: 58%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-[#2C1A0E] font-semibold mb-4">Nova Avaliação</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Título da avaliação"
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
              <select className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
                <option>Selecionar curso</option>
                <option>JavaScript Fundamentals</option>
                <option>React para Iniciantes</option>
                <option>Node.js Backend</option>
              </select>
              <select className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
                <option>Tipo de avaliação</option>
                <option>Quiz</option>
                <option>Prova</option>
                <option>Projeto</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  className="px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
                <input
                  type="number"
                  placeholder="Nota mínima"
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