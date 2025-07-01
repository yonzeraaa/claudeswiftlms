'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question, deleteQuestion, duplicateQuestion, exportQuestionsToCSV, importQuestionsFromCSV, getQuestionStats } from '@/lib/questions'
import { supabase } from '@/lib/supabase'
import QuestionEditor from './QuestionEditor'

interface QuestionBankProps {
  assessmentId?: string
  onSelectQuestion?: (question: Question) => void
  mode?: 'bank' | 'selector'
}

export default function QuestionBank({ assessmentId, onSelectQuestion, mode = 'bank' }: QuestionBankProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [stats, setStats] = useState<{ total?: number; byType?: Record<string, number>; byDifficulty?: Record<string, number>; byCategory?: Record<string, number> }>({})
  const [showImport, setShowImport] = useState(false)
  const [csvContent, setCsvContent] = useState('')

  useEffect(() => {
    loadQuestions()
    loadStats()
  }, [])

  const filterQuestions = useCallback(() => {
    const filtered = questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.category?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || q.category === selectedCategory
      const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => q.tags?.includes(tag))
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTags
    })
    
    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, selectedTags])

  useEffect(() => {
    filterQuestions()
  }, [filterQuestions])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      // Load all questions for now - can be optimized with pagination
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statistics = await getQuestionStats()
      setStats(statistics)
    } catch {
      setStats({})
    }
  }


  const handleSaveQuestion = (question: Question) => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === question.id ? question : q))
    } else {
      setQuestions(prev => [question, ...prev])
    }
    setShowEditor(false)
    setEditingQuestion(undefined)
    loadStats()
  }

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Deseja realmente excluir esta questão?')) {
      try {
        await deleteQuestion(id)
        setQuestions(prev => prev.filter(q => q.id !== id))
        loadStats()
      } catch {
        alert('Erro ao excluir questão')
      }
    }
  }

  const handleDuplicateQuestion = async (id: string) => {
    try {
      const duplicated = await duplicateQuestion(id)
      setQuestions(prev => [duplicated, ...prev])
      loadStats()
    } catch {
      alert('Erro ao duplicar questão')
    }
  }

  const handleExport = async () => {
    try {
      const csv = await exportQuestionsToCSV(assessmentId || '')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `questoes_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao exportar questões')
    }
  }

  const handleImport = async () => {
    if (!csvContent.trim() || !assessmentId) return
    
    try {
      const imported = await importQuestionsFromCSV(csvContent, assessmentId)
      setQuestions(prev => [...imported, ...prev])
      setShowImport(false)
      setCsvContent('')
      loadStats()
      alert(`${imported.length} questões importadas com sucesso!`)
    } catch {
      alert('Erro ao importar questões. Verifique o formato do CSV.')
    }
  }

  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)))
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags || [])))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b] font-montserrat">
            {mode === 'bank' ? 'Banco de Questões' : 'Selecionar Questão'}
          </h2>
          <p className="text-[#1e293b]">{filteredQuestions.length} questões encontradas</p>
        </div>
        
        {mode === 'bank' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              📥 Importar
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              📤 Exportar
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#334155] to-[#475569] hover:from-[#475569] hover:to-[#334155] text-white rounded-lg transition-all duration-300 font-medium relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              + Nova Questão
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {mode === 'bank' && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
            <h3 className="text-lg font-semibold text-[#1e293b]">{stats.total}</h3>
            <p className="text-[#1e293b]">Total de Questões</p>
          </div>
          <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
            <h3 className="text-lg font-semibold text-[#1e293b]">{Object.keys(stats.byCategory || {}).length}</h3>
            <p className="text-[#1e293b]">Categorias</p>
          </div>
          <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
            <h3 className="text-lg font-semibold text-[#1e293b]">{stats.byDifficulty?.medium || 0}</h3>
            <p className="text-[#1e293b]">Nível Médio</p>
          </div>
          <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
            <h3 className="text-lg font-semibold text-[#1e293b]">{stats.byType?.multiple_choice || 0}</h3>
            <p className="text-[#1e293b]">Múltipla Escolha</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar questões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            <option value="">Todas as dificuldades</option>
            <option value="easy">Fácil</option>
            <option value="medium">Médio</option>
            <option value="hard">Difícil</option>
          </select>

          <div className="relative">
            <select
              multiple
              value={selectedTags}
              onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
              className="p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700] h-12 relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-[#1e293b]">
              Tags (Ctrl+Click)
            </label>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
            <p className="text-[#1e293b] mt-2">Carregando questões...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#1e293b]">Nenhuma questão encontrada</p>
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div key={question.id} className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 bg-[#FFD700]/20 text-[#475569] rounded text-xs font-medium">
                      {question.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {question.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#1e293b]">{question.points} pts</span>
                    {question.category && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {question.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#1e293b] mb-2">{question.title}</h3>
                  <p className="text-[#475569] text-sm mb-3 line-clamp-2">{question.content}</p>
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {mode === 'selector' && onSelectQuestion && (
                    <button
                      onClick={() => onSelectQuestion(question)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      Selecionar
                    </button>
                  )}
                  
                  {mode === 'bank' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingQuestion(question)
                          setShowEditor(true)
                        }}
                        className="px-3 py-1 bg-[#8B4513] text-white rounded text-sm hover:bg-[#654321] transition-colors relative z-50 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDuplicateQuestion(question.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors relative z-50 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors relative z-50 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Preview of options for multiple choice */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-xs text-[#1e293b] mb-2">Opções:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.slice(0, 4).map((option, index) => (
                      <div key={index} className="text-sm text-[#475569] flex items-center">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}:</span>
                        <span className="truncate">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-[#1e293b] mb-4">Importar Questões</h3>
            <p className="text-[#1e293b] mb-4">
              Cole o conteúdo CSV ou carregue um arquivo. Formato: type,title,content,options,correct_answer,points,difficulty,category,tags,explanation
            </p>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full h-64 p-3 border border-[#94a3b8] rounded-lg focus:ring-2 focus:ring-[#FFD700] resize-none"
              placeholder="Cole o conteúdo CSV aqui..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 border border-[#94a3b8] text-[#1e293b] rounded-lg hover:bg-[#94a3b8]/20 transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-gradient-to-r from-[#334155] to-[#475569] text-white rounded-lg hover:from-[#475569] hover:to-[#334155] transition-all duration-300 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Editor */}
      {showEditor && (
        <QuestionEditor
          assessmentId={assessmentId || ''}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowEditor(false)
            setEditingQuestion(undefined)
          }}
        />
      )}
    </div>
  )
}