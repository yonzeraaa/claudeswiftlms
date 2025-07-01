import { supabase } from './supabase'

export interface FileUpload {
  file: File
  path: string
  bucket: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  uploaded_at: string
  uploaded_by: string
  course_id?: string
  lesson_id?: string
}

// Upload de arquivo
export async function uploadFile({ file, path, bucket }: FileUpload): Promise<UploadedFile> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  // Salvar metadata no banco
  const { data: fileRecord, error: dbError } = await supabase
    .from('uploaded_files')
    .insert([{
      name: file.name,
      size: file.size,
      type: file.type,
      path: path,
      url: urlData.publicUrl,
      bucket: bucket,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single()

  if (dbError) throw dbError

  return fileRecord
}

// Upload com compressão para vídeos
export async function uploadVideoWithCompression(
  file: File, 
  courseId: string, 
  lessonId: string
): Promise<UploadedFile> {
  const fileName = `${Date.now()}_${file.name}`
  const path = `courses/${courseId}/lessons/${lessonId}/videos/${fileName}`

  // Para implementação futura: compressão de vídeo
  // Por enquanto, upload direto
  const { error } = await supabase.storage
    .from('course-content')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('course-content')
    .getPublicUrl(path)

  const { data: fileRecord, error: dbError } = await supabase
    .from('uploaded_files')
    .insert([{
      name: file.name,
      size: file.size,
      type: file.type,
      path: path,
      url: urlData.publicUrl,
      bucket: 'course-content',
      course_id: courseId,
      lesson_id: lessonId,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single()

  if (dbError) throw dbError

  return fileRecord
}

// Upload de múltiplos arquivos
export async function uploadMultipleFiles(
  files: FileUpload[],
  onProgress?: (progress: number) => void
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const uploaded = await uploadFile(file)
      results.push(uploaded)
      onProgress?.((i + 1) / files.length * 100)
    } catch (error) {
      // Log error but continue with other files
      console.error(`Failed to upload ${file.file.name}:`, error)
    }
  }

  return results
}

// Deletar arquivo
export async function deleteFile(fileId: string): Promise<void> {
  // Buscar arquivo no banco
  const { data: file, error: fetchError } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('id', fileId)
    .single()

  if (fetchError || !file) throw new Error('Arquivo não encontrado')

  // Deletar do storage
  const { error: storageError } = await supabase.storage
    .from(file.bucket)
    .remove([file.path])

  if (storageError) throw storageError

  // Deletar do banco
  const { error: dbError } = await supabase
    .from('uploaded_files')
    .delete()
    .eq('id', fileId)

  if (dbError) throw dbError
}

// Listar arquivos
export async function getFiles(filters?: {
  courseId?: string
  lessonId?: string
  type?: string
  uploadedBy?: string
}): Promise<UploadedFile[]> {
  let query = supabase
    .from('uploaded_files')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (filters?.courseId) {
    query = query.eq('course_id', filters.courseId)
  }

  if (filters?.lessonId) {
    query = query.eq('lesson_id', filters.lessonId)
  }

  if (filters?.type) {
    query = query.ilike('type', `${filters.type}%`)
  }

  if (filters?.uploadedBy) {
    query = query.eq('uploaded_by', filters.uploadedBy)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Obter estatísticas de storage
export async function getStorageStats(): Promise<{
  totalFiles: number
  totalSize: number
  byType: Record<string, { count: number; size: number }>
  byCourse: Record<string, { count: number; size: number }>
}> {
  const { data, error } = await supabase
    .from('uploaded_files')
    .select('type, size, course_id')

  if (error) throw error

  const stats = {
    totalFiles: data.length,
    totalSize: data.reduce((sum, file) => sum + file.size, 0),
    byType: {} as Record<string, { count: number; size: number }>,
    byCourse: {} as Record<string, { count: number; size: number }>
  }

  data.forEach(file => {
    const type = file.type.split('/')[0] // video, image, application, etc.
    
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, size: 0 }
    }
    stats.byType[type].count++
    stats.byType[type].size += file.size

    if (file.course_id) {
      if (!stats.byCourse[file.course_id]) {
        stats.byCourse[file.course_id] = { count: 0, size: 0 }
      }
      stats.byCourse[file.course_id].count++
      stats.byCourse[file.course_id].size += file.size
    }
  })

  return stats
}

// Validar arquivo
export function validateFile(file: File, options?: {
  maxSize?: number // em bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || 100 * 1024 * 1024 // 100MB default
  const allowedTypes = options?.allowedTypes || ['video/*', 'image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  // Verificar tamanho
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${formatFileSize(maxSize)}`
    }
  }

  // Verificar tipo
  const isTypeAllowed = allowedTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      return file.type.startsWith(allowedType.replace('/*', '/'))
    }
    return file.type === allowedType
  })

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`
    }
  }

  // Verificar extensão se especificado
  if (options?.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !options.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Extensão não permitida. Permitidas: ${options.allowedExtensions.join(', ')}`
      }
    }
  }

  return { valid: true }
}

// Formatar tamanho de arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Gerar thumbnail para vídeo
export async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.addEventListener('loadedmetadata', () => {
      // Seek to 10% of the video duration for thumbnail
      video.currentTime = video.duration * 0.1
    })

    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnail)
      } else {
        reject(new Error('Could not get canvas context'))
      }
    })

    video.addEventListener('error', () => {
      reject(new Error('Error loading video'))
    })

    video.src = URL.createObjectURL(file)
  })
}

// Organizar arquivos por curso/lição
export async function organizeFileStructure(courseId: string): Promise<{
  videos: UploadedFile[]
  documents: UploadedFile[]
  images: UploadedFile[]
  others: UploadedFile[]
}> {
  const files = await getFiles({ courseId })
  
  const organized = {
    videos: files.filter(f => f.type.startsWith('video/')),
    documents: files.filter(f => 
      f.type.includes('pdf') || 
      f.type.includes('document') || 
      f.type.includes('text')
    ),
    images: files.filter(f => f.type.startsWith('image/')),
    others: files.filter(f => 
      !f.type.startsWith('video/') &&
      !f.type.startsWith('image/') &&
      !f.type.includes('pdf') &&
      !f.type.includes('document') &&
      !f.type.includes('text')
    )
  }

  return organized
}