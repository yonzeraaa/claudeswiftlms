import { supabase } from './supabase'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'student'
  created_at: string
  updated_at: string
  avatar_url?: string
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  studentCount: number
  instructorCount: number
  adminCount: number
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getUserStats(): Promise<UserStats> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
  
  if (error) throw error
  
  const stats = data.reduce((acc, user) => {
    acc.totalUsers++
    acc.activeUsers++ // Todos são ativos por padrão
    if (user.role === 'student') acc.studentCount++
    if (user.role === 'admin') acc.adminCount++
    return acc
  }, {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    studentCount: 0,
    instructorCount: 0,
    adminCount: 0
  })
  
  return stats
}

export async function updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deactivateUser(id: string): Promise<void> {
  // Por enquanto, vamos apenas simular - não temos coluna status
  console.log('Deactivating user:', id)
}

export async function activateUser(id: string): Promise<void> {
  // Por enquanto, vamos apenas simular - não temos coluna status
  console.log('Activating user:', id)
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getUsersWithEnrollmentCount(): Promise<Array<UserProfile & { course_count: number }>> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      enrollments(count)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(user => ({
    ...user,
    course_count: user.enrollments?.[0]?.count || 0
  }))
}