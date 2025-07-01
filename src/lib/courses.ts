import { supabase } from './supabase'

export interface Course {
  id: string
  title: string
  description: string
  duration_hours: number
  status: 'published' | 'draft' | 'archived'
  created_at: string
  updated_at: string
  instructor_id: string
  thumbnail_url?: string
  instructor?: {
    id: string
    full_name: string
  }
  enrollment_count?: number
  progress?: number
}

export interface CourseStats {
  totalCourses: number
  activeCourses: number
  draftCourses: number
  archivedCourses: number
  totalEnrollments: number
  averageRating: number
}

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name),
      enrollments(count)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(course => ({
    ...course,
    enrollment_count: course.enrollments?.[0]?.count || 0
  }))
}

export async function getCourseById(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name),
      enrollments(count)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  return {
    ...data,
    enrollment_count: data.enrollments?.[0]?.count || 0
  }
}

export async function getCourseStats(): Promise<CourseStats> {
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('status')
  
  if (coursesError) throw coursesError
  
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('id')
  
  if (enrollmentsError) throw enrollmentsError
  
  const stats = courses.reduce((acc, course) => {
    acc.totalCourses++
    if (course.status === 'published') acc.activeCourses++
    if (course.status === 'draft') acc.draftCourses++
    if (course.status === 'archived') acc.archivedCourses++
    return acc
  }, {
    totalCourses: 0,
    activeCourses: 0,
    draftCourses: 0,
    archivedCourses: 0,
    totalEnrollments: enrollments.length,
    averageRating: 4.2
  })
  
  return stats
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCourse(id: string): Promise<void> {
  console.log('Iniciando exclusão do curso:', id)
  
  // Verificar usuário atual e permissões
  const { data: user } = await supabase.auth.getUser()
  console.log('Usuário atual:', user?.user?.id)
  
  if (!user?.user) {
    throw new Error('Usuário não autenticado')
  }
  
  // Verificar se é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.user.id)
    .single()
  
  console.log('Perfil do usuário:', profile)
  
  if (profile?.role !== 'admin') {
    throw new Error('Apenas administradores podem excluir cursos')
  }
  
  // Primeiro, excluir todas as avaliações relacionadas ao curso
  const { error: assessmentsError } = await supabase
    .from('assessments')
    .delete()
    .eq('course_id', id)
  
  if (assessmentsError) {
    console.error('Erro ao excluir avaliações do curso:', assessmentsError)
    throw new Error(`Falha ao excluir avaliações do curso: ${assessmentsError.message}`)
  }
  
  // Em seguida, excluir todas as matrículas relacionadas ao curso
  const { error: enrollmentsError } = await supabase
    .from('enrollments')
    .delete()
    .eq('course_id', id)
  
  if (enrollmentsError) {
    console.error('Erro ao excluir matrículas do curso:', enrollmentsError)
    throw new Error(`Falha ao excluir matrículas do curso: ${enrollmentsError.message}`)
  }
  
  // Excluir todos os eventos relacionados ao curso
  const { error: eventsError } = await supabase
    .from('events')
    .delete()
    .eq('course_id', id)
  
  if (eventsError) {
    console.error('Erro ao excluir eventos do curso:', eventsError)
    throw new Error(`Falha ao excluir eventos do curso: ${eventsError.message}`)
  }
  
  // Por fim, excluir o curso
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Erro na exclusão do curso:', error)
    throw new Error(`Falha ao excluir curso: ${error.message}`)
  }
  
  console.log('Resposta da exclusão:', data)
  
  if (!data || data.length === 0) {
    console.warn('Nenhum curso foi excluído - pode não existir no banco')
    throw new Error('Curso não encontrado ou já foi excluído')
  }
  
  console.log('Curso excluído com sucesso no banco')
}

export async function getPopularCourses(limit: number = 5): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name),
      enrollments(count)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  
  return data.map(course => ({
    ...course,
    enrollment_count: course.enrollments?.[0]?.count || 0
  })).sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
}

export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name),
      enrollments(count)
    `)
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(course => ({
    ...course,
    enrollment_count: course.enrollments?.[0]?.count || 0
  }))
}

export async function getInstructors(): Promise<Array<{id: string, full_name: string}>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'admin') // Por enquanto, apenas admins podem ser instrutores
    .order('full_name')
  
  if (error) throw error
  return data || []
}