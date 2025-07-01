import { supabase } from './supabase'

export interface SystemSettings {
  id: string
  site_name: string
  site_description: string
  allow_registration: boolean
  email_notifications: boolean
  maintenance_mode: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  max_students_per_course: number
  certificate_template: 'modern' | 'classic' | 'elegant' | 'minimal'
  primary_color: string
  secondary_color: string
  logo_url?: string
  director_name?: string
  director_title?: string
  certificate_text?: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  new_student: boolean
  course_completion: boolean
  assessment_submission: boolean
  system_updates: boolean
  weekly_reports: boolean
  updated_at: string
}

export interface Integration {
  id: string
  name: string
  status: 'connected' | 'disconnected'
  description: string
  config?: Record<string, unknown>
  updated_at: string
}

export async function getSystemSettings(): Promise<SystemSettings | null> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  // Primeiro, verificar se já existe uma configuração
  const existing = await getSystemSettings()
  
  if (existing) {
    const { data, error } = await supabase
      .from('system_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // Criar nova configuração
    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        ...settings,
        site_name: settings.site_name || 'SwiftEDU',
        site_description: settings.site_description || 'Plataforma de ensino online premium',
        allow_registration: settings.allow_registration || false,
        email_notifications: settings.email_notifications || true,
        maintenance_mode: settings.maintenance_mode || false,
        backup_frequency: settings.backup_frequency || 'daily',
        max_students_per_course: settings.max_students_per_course || 100,
        certificate_template: settings.certificate_template || 'modern',
        primary_color: settings.primary_color || '#654321',
        secondary_color: settings.secondary_color || '#FFD700'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
  const existing = await getNotificationSettings()
  
  if (existing) {
    const { data, error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('notification_settings')
      .insert({
        ...settings,
        new_student: settings.new_student || true,
        course_completion: settings.course_completion || true,
        assessment_submission: settings.assessment_submission || true,
        system_updates: settings.system_updates || true,
        weekly_reports: settings.weekly_reports || true
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export async function getAllIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createIntegration(integration: Omit<Integration, 'id' | 'updated_at'>): Promise<Integration> {
  const { data, error } = await supabase
    .from('integrations')
    .insert(integration)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function triggerBackup(): Promise<{ success: boolean; message: string }> {
  // Simular ação de backup
  try {
    // Em um ambiente real, aqui faria a chamada para o serviço de backup
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      message: 'Backup iniciado com sucesso'
    }
  } catch {
    return {
      success: false,
      message: 'Erro ao iniciar backup'
    }
  }
}

export async function uploadLogo(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `logo.${fileExt}`
  
  const { error } = await supabase.storage
    .from('system-assets')
    .upload(fileName, file, {
      upsert: true
    })
  
  if (error) throw error
  
  const { data: publicUrl } = supabase.storage
    .from('system-assets')
    .getPublicUrl(fileName)
  
  return publicUrl.publicUrl
}