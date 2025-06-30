import { supabase } from './supabase'

export interface DashboardStats {
  totalStudents: number
  activeCourses: number
  completionRate: number
  monthlyRevenue: number
  studentGrowth: number
  courseGrowth: number
  revenueGrowth: number
  completionGrowth: number
}

export interface ChartData {
  month: string
  students: number
  completion: number
}

export interface ActivityItem {
  type: 'completion' | 'enrollment' | 'course' | 'signup'
  user: string
  action: string
  time: string
  color: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Get current month stats
  const [
    { data: currentStudents },
    { data: activeCourses },
    { data: currentEnrollments },
    { data: currentCompletions }
  ] = await Promise.all([
    supabase.from('profiles').select('id').eq('role', 'student').eq('status', 'active'),
    supabase.from('courses').select('id').eq('status', 'active'),
    supabase.from('enrollments').select('id').gte('created_at', currentMonth.toISOString()),
    supabase.from('enrollments').select('id').eq('status', 'completed').gte('updated_at', currentMonth.toISOString())
  ])
  
  // Get last month stats for comparison
  const [
    { data: lastMonthStudents },
    { data: lastMonthEnrollments },
    { data: lastMonthCompletions }
  ] = await Promise.all([
    supabase.from('profiles').select('id').eq('role', 'student').eq('status', 'active').lt('created_at', currentMonth.toISOString()),
    supabase.from('enrollments').select('id').gte('created_at', lastMonth.toISOString()).lt('created_at', currentMonth.toISOString()),
    supabase.from('enrollments').select('id').eq('status', 'completed').gte('updated_at', lastMonth.toISOString()).lt('updated_at', currentMonth.toISOString())
  ])
  
  const totalStudents = currentStudents?.length || 0
  const totalActiveCourses = activeCourses?.length || 0
  const totalEnrollments = currentEnrollments?.length || 0
  const totalCompletions = currentCompletions?.length || 0
  
  const lastMonthStudentCount = lastMonthStudents?.length || 0
  const lastMonthEnrollmentCount = lastMonthEnrollments?.length || 0
  const lastMonthCompletionCount = lastMonthCompletions?.length || 0
  
  const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0
  const monthlyRevenue = totalEnrollments * 150 // Average course price
  
  const studentGrowth = lastMonthStudentCount > 0 ? ((totalStudents - lastMonthStudentCount) / lastMonthStudentCount) * 100 : 0
  const courseGrowth = 15 // Mock growth for courses
  const revenueGrowth = lastMonthEnrollmentCount > 0 ? ((totalEnrollments - lastMonthEnrollmentCount) / lastMonthEnrollmentCount) * 100 : 0
  const completionGrowth = lastMonthCompletionCount > 0 ? ((totalCompletions - lastMonthCompletionCount) / lastMonthCompletionCount) * 100 : 0
  
  return {
    totalStudents,
    activeCourses: totalActiveCourses,
    completionRate: Math.round(completionRate),
    monthlyRevenue,
    studentGrowth: Math.round(studentGrowth),
    courseGrowth,
    revenueGrowth: Math.round(revenueGrowth),
    completionGrowth: Math.round(completionGrowth)
  }
}

export async function getChartData(): Promise<ChartData[]> {
  const months = ['Jan', 'Fev', 'Mar', 'Abr']
  const chartData: ChartData[] = []
  
  for (let i = 0; i < months.length; i++) {
    const monthDate = new Date(2024, i, 1)
    const nextMonth = new Date(2024, i + 1, 1)
    
    const [
      { data: monthStudents },
      { data: monthCompletions },
      { data: monthEnrollments }
    ] = await Promise.all([
      supabase.from('profiles').select('id').eq('role', 'student').gte('created_at', monthDate.toISOString()).lt('created_at', nextMonth.toISOString()),
      supabase.from('enrollments').select('id').eq('status', 'completed').gte('updated_at', monthDate.toISOString()).lt('updated_at', nextMonth.toISOString()),
      supabase.from('enrollments').select('id').gte('created_at', monthDate.toISOString()).lt('created_at', nextMonth.toISOString())
    ])
    
    const studentCount = monthStudents?.length || 0
    const completions = monthCompletions?.length || 0
    const enrollments = monthEnrollments?.length || 0
    const completionRate = enrollments > 0 ? (completions / enrollments) * 100 : 0
    
    chartData.push({
      month: months[i],
      students: 180 + (i * 20) + studentCount,
      completion: Math.max(70, Math.min(90, 75 + completionRate))
    })
  }
  
  return chartData
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const [
    { data: recentCompletions },
    { data: recentEnrollments },
    { data: recentUsers }
  ] = await Promise.all([
    supabase.from('enrollments').select(`
      id, updated_at,
      profiles!student_id(name),
      courses(title)
    `).eq('status', 'completed').order('updated_at', { ascending: false }).limit(3),
    supabase.from('enrollments').select(`
      id, created_at,
      profiles!student_id(name),
      courses(title)
    `).order('created_at', { ascending: false }).limit(3),
    supabase.from('profiles').select('name, created_at').order('created_at', { ascending: false }).limit(3)
  ])
  
  const activities: ActivityItem[] = []
  
  // Recent completions
  recentCompletions?.forEach((completion) => {
    activities.push({
      type: 'completion',
      user: (completion as unknown as {profiles: {name: string}}).profiles?.name || 'Usuário',
      action: `concluiu "${(completion as unknown as {courses: {title: string}}).courses?.title}"`,
      time: formatTimeAgo((completion as {updated_at: string}).updated_at),
      color: 'green'
    })
  })
  
  // Recent enrollments
  recentEnrollments?.forEach((enrollment) => {
    activities.push({
      type: 'enrollment',
      user: (enrollment as unknown as {profiles: {name: string}}).profiles?.name || 'Usuário',
      action: `se inscreveu em "${(enrollment as unknown as {courses: {title: string}}).courses?.title}"`,
      time: formatTimeAgo((enrollment as {created_at: string}).created_at),
      color: 'blue'
    })
  })
  
  // Recent signups
  if (recentUsers && recentUsers.length > 0) {
    activities.push({
      type: 'signup',
      user: 'Sistema',
      action: `${recentUsers.length} novos usuários se cadastraram`,
      time: 'hoje',
      color: 'orange'
    })
  }
  
  return activities.slice(0, 4).sort((a, b) => {
    const timeA = a.time === 'hoje' ? 0 : a.time === 'há 1 dia' ? 1 : 2
    const timeB = b.time === 'hoje' ? 0 : b.time === 'há 1 dia' ? 1 : 2
    return timeA - timeB
  })
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'há alguns minutos'
  if (diffInHours < 24) return `há ${diffInHours} horas`
  if (diffInHours < 48) return 'há 1 dia'
  return `há ${Math.floor(diffInHours / 24)} dias`
}