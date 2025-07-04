import { supabase } from './supabase'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'student' | 'instructor'
  status: 'active' | 'frozen' | 'deleted'
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
    .neq('status', 'deleted')
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
    if (user.role === 'instructor') acc.instructorCount++
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

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch('/api/admin/delete-user', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: id }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Falha ao excluir usuário')
  }
}

export async function freezeUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'frozen' })
    .eq('id', id)
  
  if (error) throw error
}

export async function unfreezeUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', id)
  
  if (error) throw error
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
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data.map(user => ({
    ...user,
    course_count: user.enrollments?.[0]?.count || 0
  }))
}

export async function createUser(userData: {
  email: string
  full_name: string
  role: 'admin' | 'student' | 'instructor'
  password: string
}): Promise<UserProfile> {
  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.full_name,
        role: userData.role
      }
    }
  })
  
  if (authError) throw authError
  if (!authData.user) throw new Error('Falha na criação do usuário')

  // Aguardar um pouco para o trigger criar o perfil
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Tentar buscar o perfil com retry
  let retries = 5
  let profileData: UserProfile | null = null
  
  while (retries > 0 && !profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (data) {
      profileData = data
      break
    }
    
    if (error && !error.message.includes('No rows')) {
      throw error
    }
    
    // Aguardar antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, 500))
    retries--
  }
  
  if (!profileData) {
    throw new Error('Perfil não foi criado automaticamente')
  }
  
  return profileData
}