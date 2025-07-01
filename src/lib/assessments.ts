import { supabase } from './supabase'

export interface Assessment {
  id: string
  title: string
  description?: string
  course_id: string
  type: 'quiz' | 'exam' | 'project'
  time_limit?: number
  passing_score: number
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
  course?: {
    id: string
    title: string
  }
  questions_count?: number
  submissions_count?: number
  average_score?: number
}

export interface Question {
  id: string
  assessment_id: string
  question_text: string
  type: 'multiple_choice' | 'essay' | 'true_false'
  options?: string[]
  correct_answer?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  created_at: string
}

export interface AssessmentStats {
  totalAssessments: number
  activeAssessments: number
  draftAssessments: number
  pendingGrading: number
  averageScore: number
  passRate: number
}

export async function getAllAssessments(): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      course:courses(id, title),
      questions(count),
      assessment_submissions(count, score)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(assessment => ({
    ...assessment,
    questions_count: assessment.questions?.[0]?.count || 0,
    submissions_count: assessment.assessment_submissions?.length || 0,
    average_score: assessment.assessment_submissions?.length > 0 
      ? assessment.assessment_submissions.reduce((sum: number, sub: { score?: number }) => sum + (sub.score || 0), 0) / assessment.assessment_submissions.length
      : 0
  }))
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      course:courses(id, title),
      questions(count),
      assessment_submissions(count, score)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  return {
    ...data,
    questions_count: data.questions?.[0]?.count || 0,
    submissions_count: data.assessment_submissions?.length || 0,
    average_score: data.assessment_submissions?.length > 0 
      ? data.assessment_submissions.reduce((sum: number, sub: { score?: number }) => sum + (sub.score || 0), 0) / data.assessment_submissions.length
      : 0
  }
}

export async function createAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert(assessment)
    .select(`
      *,
      course:courses(id, title)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      course:courses(id, title)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAssessment(id: string): Promise<void> {
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getAssessmentStats(): Promise<AssessmentStats> {
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select('status')
  
  if (assessmentsError) throw assessmentsError
  
  const { data: submissions, error: submissionsError } = await supabase
    .from('assessment_submissions')
    .select('score, status')
  
  if (submissionsError) throw submissionsError
  
  const stats = assessments.reduce((acc, assessment) => {
    acc.totalAssessments++
    if (assessment.status === 'active') acc.activeAssessments++
    if (assessment.status === 'draft') acc.draftAssessments++
    return acc
  }, {
    totalAssessments: 0,
    activeAssessments: 0,
    draftAssessments: 0,
    pendingGrading: 0,
    averageScore: 0,
    passRate: 0
  })
  
  const pendingSubmissions = submissions.filter(sub => sub.status === 'submitted').length
  const gradedSubmissions = submissions.filter(sub => sub.status === 'graded' && sub.score !== null)
  const passedSubmissions = gradedSubmissions.filter(sub => sub.score >= 7.0)
  
  stats.pendingGrading = pendingSubmissions
  stats.averageScore = gradedSubmissions.length > 0 
    ? gradedSubmissions.reduce((sum, sub) => sum + sub.score, 0) / gradedSubmissions.length
    : 0
  stats.passRate = gradedSubmissions.length > 0 
    ? (passedSubmissions.length / gradedSubmissions.length) * 100
    : 0
  
  return stats
}

export async function getQuestionsByAssessment(assessmentId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}