import { supabase } from './supabase'

export interface Question {
  id: string
  assessment_id: string
  type: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
  title: string
  content: string
  options?: string[]
  correct_answer?: string | string[]
  points: number
  order: number
  explanation?: string
  tags?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  created_at: string
  updated_at: string
}

export interface QuestionBank {
  id: string
  title: string
  description?: string
  category: string
  tags: string[]
  questions_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: string
  text: string
  is_correct: boolean
}

// Criar nova questão
export async function createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .insert([question])
    .select()
    .single()

  if (error) throw error
  return data
}

// Buscar questões por avaliação
export async function getQuestionsByAssessment(assessmentId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('order', { ascending: true })

  if (error) throw error
  return data || []
}

// Buscar questões por categoria
export async function getQuestionsByCategory(category: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Buscar questões por tags
export async function getQuestionsByTags(tags: string[]): Promise<Question[]> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .overlaps('tags', tags)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Atualizar questão
export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deletar questão
export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('assessment_questions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Duplicar questão
export async function duplicateQuestion(id: string): Promise<Question> {
  // Buscar questão original
  const { data: original, error: fetchError } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Criar cópia
  const duplicate = {
    ...original,
    title: `${original.title} (Cópia)`,
    id: undefined,
    created_at: undefined,
    updated_at: undefined
  }

  return createQuestion(duplicate)
}

// Importar questões do CSV
export async function importQuestionsFromCSV(csvContent: string, assessmentId: string): Promise<Question[]> {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    if (values.length < headers.length) continue

    const questionData: any = {
      assessment_id: assessmentId,
      order: i
    }

    headers.forEach((header, index) => {
      const value = values[index]
      
      switch (header.toLowerCase()) {
        case 'type':
          questionData.type = value
          break
        case 'title':
          questionData.title = value
          break
        case 'content':
          questionData.content = value
          break
        case 'options':
          questionData.options = value ? value.split('|') : []
          break
        case 'correct_answer':
          questionData.correct_answer = value
          break
        case 'points':
          questionData.points = parseInt(value) || 1
          break
        case 'difficulty':
          questionData.difficulty = value || 'medium'
          break
        case 'category':
          questionData.category = value
          break
        case 'tags':
          questionData.tags = value ? value.split('|') : []
          break
        case 'explanation':
          questionData.explanation = value
          break
      }
    })

    if (questionData.title && questionData.content) {
      questions.push(await createQuestion(questionData))
    }
  }

  return questions
}

// Exportar questões para CSV
export async function exportQuestionsToCSV(assessmentId: string): Promise<string> {
  const questions = await getQuestionsByAssessment(assessmentId)
  
  const headers = [
    'type', 'title', 'content', 'options', 'correct_answer', 
    'points', 'difficulty', 'category', 'tags', 'explanation'
  ]
  
  const csvLines = [headers.join(',')]
  
  questions.forEach(q => {
    const row = [
      q.type,
      `"${q.title}"`,
      `"${q.content}"`,
      q.options ? `"${q.options.join('|')}"` : '',
      Array.isArray(q.correct_answer) ? `"${q.correct_answer.join('|')}"` : `"${q.correct_answer || ''}"`,
      q.points.toString(),
      q.difficulty,
      q.category || '',
      q.tags ? `"${q.tags.join('|')}"` : '',
      q.explanation ? `"${q.explanation}"` : ''
    ]
    csvLines.push(row.join(','))
  })
  
  return csvLines.join('\n')
}

// Buscar estatísticas das questões
export async function getQuestionStats(): Promise<{
  total: number
  byType: Record<string, number>
  byDifficulty: Record<string, number>
  byCategory: Record<string, number>
}> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('type, difficulty, category')

  if (error) throw error

  const stats = {
    total: data.length,
    byType: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byCategory: {} as Record<string, number>
  }

  data.forEach(q => {
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1
    if (q.category) {
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1
    }
  })

  return stats
}

// Gerar questão aleatória por critérios
export async function getRandomQuestions(criteria: {
  count: number
  category?: string
  difficulty?: string
  tags?: string[]
  assessmentId?: string
}): Promise<Question[]> {
  let query = supabase
    .from('assessment_questions')
    .select('*')

  if (criteria.category) {
    query = query.eq('category', criteria.category)
  }

  if (criteria.difficulty) {
    query = query.eq('difficulty', criteria.difficulty)
  }

  if (criteria.tags?.length) {
    query = query.overlaps('tags', criteria.tags)
  }

  if (criteria.assessmentId) {
    query = query.neq('assessment_id', criteria.assessmentId)
  }

  const { data, error } = await query.order('random()')

  if (error) throw error
  
  return (data || []).slice(0, criteria.count)
}