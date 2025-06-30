import { supabase } from './supabase'

export interface Course {
  id: string
  title: string
  description: string
  category: string
  price: number
  duration: number
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
  instructor_id: string
  thumbnail_url?: string
  instructor?: {
    id: string
    name: string
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
      instructor:profiles!instructor_id(id, name),
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
      instructor:profiles!instructor_id(id, name),
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
    if (course.status === 'active') acc.activeCourses++
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
      instructor:profiles!instructor_id(id, name)
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
      instructor:profiles!instructor_id(id, name)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getPopularCourses(limit: number = 5): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, name),
      enrollments(count)
    `)
    .eq('status', 'active')
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
      instructor:profiles!instructor_id(id, name),
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

export async function getInstructors(): Promise<Array<{id: string, name: string}>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'instructor')
    .eq('status', 'active')
    .order('name')
  
  if (error) throw error
  return data || []
}