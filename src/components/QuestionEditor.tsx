'use client'

import { useState, useEffect } from 'react'
import { Question, createQuestion, updateQuestion } from '@/lib/questions'

interface QuestionEditorProps {
  assessmentId: string
  question?: Question
  onSave: (question: Question) => void
  onCancel: () => void
}

export default function QuestionEditor({ assessmentId, question, onSave, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState({
    type: 'multiple_choice' as Question['type'],
    title: '',
    content: '',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    difficulty: 'medium' as Question['difficulty'],
    category: '',
    tags: [] as string[],
    explanation: ''
  })
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (question) {
      setFormData({
        type: question.type,
        title: question.title,
        content: question.content,
        options: question.options || ['', '', '', ''],
        correct_answer: Array.isArray(question.correct_answer) 
          ? question.correct_answer.join(',') 
          : question.correct_answer || '',
        points: question.points,
        difficulty: question.difficulty,
        category: question.category || '',
        tags: question.tags || [],
        explanation: question.explanation || ''
      })
    }
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const questionData = {
        assessment_id: assessmentId,
        type: formData.type,
        title: formData.title,
        content: formData.content,
        options: formData.type === 'multiple_choice' ? formData.options.filter(opt => opt.trim()) : undefined,
        correct_answer: formData.correct_answer,
        points: formData.points,
        order: question?.order || 1,
        difficulty: formData.difficulty,
        category: formData.category || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        explanation: formData.explanation || undefined
      }

      const savedQuestion = question 
        ? await updateQuestion(question.id, questionData)
        : await createQuestion(questionData)

      onSave(savedQuestion)
    } catch {
      alert('Erro ao salvar questão')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const renderQuestionPreview = () => (
    <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
      <h3 className="text-lg font-semibold text-[#2C1A0E] mb-4">Preview da Questão</h3>
      
      <div className="bg-white/50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-medium text-[#3D2914] bg-[#FFD700]/20 px-2 py-1 rounded">
            {formData.type.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-[#5D3A1F]">{formData.points} ponto(s)</span>
        </div>

        <h4 className="font-semibold text-[#2C1A0E] mb-2">{formData.title || 'Título da questão'}</h4>
        <p className="text-[#3D2914] mb-4">{formData.content || 'Conteúdo da questão'}</p>

        {formData.type === 'multiple_choice' && (
          <div className="space-y-2">
            {formData.options.filter(opt => opt.trim()).map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="preview" 
                  className="text-[#8B4513]"
                  disabled
                />
                <span className="text-[#3D2914]">{option}</span>
              </label>
            ))}
          </div>
        )}

        {formData.type === 'true_false' && (
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="preview" disabled />
              <span className="text-[#3D2914]">Verdadeiro</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="preview" disabled />
              <span className="text-[#3D2914]">Falso</span>
            </label>
          </div>
        )}

        {formData.type === 'essay' && (
          <textarea 
            className="w-full p-3 border border-[#D2B48C] rounded-lg resize-none"
            rows={4}
            placeholder="Área para resposta dissertativa..."
            disabled
          />
        )}

        {formData.explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explicação:</strong> {formData.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#D2B48C]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#2C1A0E] font-montserrat">
              {question ? 'Editar Questão' : 'Nova Questão'}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#654321] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {previewMode ? 'Editar' : 'Preview'}
              </button>
              <button
                onClick={onCancel}
                className="text-[#5D3A1F] hover:text-[#3D2914] relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {previewMode ? (
            renderQuestionPreview()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo e Configurações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Tipo de Questão
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="true_false">Verdadeiro/Falso</option>
                    <option value="essay">Dissertativa</option>
                    <option value="fill_blank">Preencher Lacuna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Pontuação
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Dificuldade
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Question['difficulty'] }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>

              {/* Título e Conteúdo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Título da Questão *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Enunciado da Questão *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] resize-none"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Opções para Múltipla Escolha */}
              {formData.type === 'multiple_choice' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-semibold text-[#2C1A0E]">
                      Opções de Resposta
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-3 py-1 bg-[#8B4513] text-white rounded text-sm hover:bg-[#654321] transition-colors relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-[#5D3A1F] w-8">
                          {String.fromCharCode(65 + index)}:
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 p-2 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                          placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-700 relative z-50 cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resposta Correta */}
              <div>
                <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                  Resposta Correta *
                </label>
                {formData.type === 'multiple_choice' ? (
                  <select
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    required
                  >
                    <option value="">Selecione a opção correta</option>
                    {formData.options.map((option, index) => (
                      option.trim() && (
                        <option key={index} value={String.fromCharCode(65 + index)}>
                          {String.fromCharCode(65 + index)}: {option}
                        </option>
                      )
                    ))}
                  </select>
                ) : formData.type === 'true_false' ? (
                  <select
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="true">Verdadeiro</option>
                    <option value="false">Falso</option>
                  </select>
                ) : (
                  <textarea
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] resize-none"
                    rows={3}
                    placeholder="Resposta modelo ou palavras-chave"
                  />
                )}
              </div>

              {/* Categoria e Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                    placeholder="Ex: Matemática, História..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700]"
                      placeholder="Digite uma tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#654321] transition-colors relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      +
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-[#FFD700]/20 text-[#3D2914] px-2 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-red-500 hover:text-red-700 relative z-50 cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Explicação */}
              <div>
                <label className="block text-sm font-semibold text-[#2C1A0E] mb-2">
                  Explicação (Opcional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  className="w-full p-3 border border-[#D2B48C] rounded-lg focus:ring-2 focus:ring-[#FFD700] resize-none"
                  rows={3}
                  placeholder="Explicação que será mostrada após a resposta..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-[#D2B48C]">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-[#D2B48C] text-[#5D3A1F] rounded-lg hover:bg-[#D2B48C]/20 transition-colors relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  {loading ? 'Salvando...' : (question ? 'Atualizar' : 'Criar Questão')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}