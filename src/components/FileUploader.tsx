'use client'

import { useState, useRef, useCallback } from 'react'
import { uploadMultipleFiles, validateFile, formatFileSize, generateVideoThumbnail, UploadedFile } from '@/lib/storage'

interface FileUploaderProps {
  courseId?: string
  lessonId?: string
  allowedTypes?: string[]
  maxSize?: number
  multiple?: boolean
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadProgress?: (progress: number) => void
  className?: string
}

export default function FileUploader({
  courseId,
  lessonId,
  allowedTypes = ['video/*', 'image/*', 'application/pdf'],
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  onUploadComplete,
  onUploadProgress,
  className = ''
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ [key: string]: string }>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFilesList = Array.from(e.target.files)
      handleFiles(selectedFilesList)
    }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles: File[] = []
    const newErrors: string[] = []

    // Validar cada arquivo
    for (const file of files) {
      const validation = validateFile(file, { maxSize, allowedTypes })
      if (validation.valid) {
        validFiles.push(file)
      } else {
        newErrors.push(`${file.name}: ${validation.error}`)
      }
    }

    setErrors(newErrors)
    
    if (!multiple && validFiles.length > 1) {
      setErrors(prev => [...prev, 'Apenas um arquivo é permitido'])
      return
    }

    setSelectedFiles(multiple ? [...selectedFiles, ...validFiles] : validFiles)

    // Gerar previews
    const newPreviews: { [key: string]: string } = {}
    for (const file of validFiles) {
      if (file.type.startsWith('image/')) {
        newPreviews[file.name] = URL.createObjectURL(file)
      } else if (file.type.startsWith('video/')) {
        try {
          newPreviews[file.name] = await generateVideoThumbnail(file)
        } catch {
          // Usar ícone padrão se não conseguir gerar thumbnail
          newPreviews[file.name] = '/video-placeholder.svg'
        }
      }
    }
    
    setPreviews(prev => ({ ...prev, ...newPreviews }))
  }

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName))
    setPreviews(prev => {
      const updated = { ...prev }
      delete updated[fileName]
      return updated
    })
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploads: { file: File; path: string; bucket: string }[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileName = `${Date.now()}_${file.name}`
        
        let path: string
        let bucket: string

        if (courseId && lessonId) {
          // Upload para estrutura de curso/lição
          if (file.type.startsWith('video/')) {
            path = `courses/${courseId}/lessons/${lessonId}/videos/${fileName}`
          } else if (file.type.startsWith('image/')) {
            path = `courses/${courseId}/lessons/${lessonId}/images/${fileName}`
          } else {
            path = `courses/${courseId}/lessons/${lessonId}/documents/${fileName}`
          }
          bucket = 'course-content'
        } else {
          // Upload geral
          path = `uploads/${fileName}`
          bucket = 'general-uploads'
        }

        uploads.push({ file, path, bucket })
      }

      const results = await uploadMultipleFiles(uploads, (progress) => {
        setUploadProgress(progress)
        onUploadProgress?.(progress)
      })

      setUploadedFiles(results)
      onUploadComplete?.(results)
      
      // Limpar seleção após upload bem-sucedido
      setSelectedFiles([])
      setPreviews({})
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch {
      setErrors(prev => [...prev, 'Erro durante o upload. Tente novamente.'])
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('document')) return '📝'
    return '📎'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#FFD700] bg-[#FFD700]/10'
            : 'border-[#D2B48C] hover:border-[#FFD700] hover:bg-[#FFD700]/5'
        }`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#8B4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-[#2C1A0E]">
              Arrastar e soltar arquivos aqui
            </h3>
            <p className="text-[#5D3A1F] mt-1">
              ou{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#8B4513] hover:text-[#654321] font-medium underline relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                selecione os arquivos
              </button>
            </p>
          </div>

          <div className="text-sm text-[#5D3A1F] space-y-1">
            <p>Tamanho máximo: {formatFileSize(maxSize)}</p>
            <p>Tipos permitidos: {allowedTypes.map(t => t.replace('/*', '')).join(', ')}</p>
            {!multiple && <p>⚠️ Apenas um arquivo por vez</p>}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Erros encontrados:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <button
            onClick={() => setErrors([])}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline relative z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            Limpar erros
          </button>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-[#2C1A0E]">
            Arquivos Selecionados ({selectedFiles.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file) => (
              <div key={file.name} className="glass-card p-4 rounded-lg border border-[#D2B48C]">
                {/* Preview */}
                {previews[file.name] ? (
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={previews[file.name]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">{getFileIcon(file.type)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                    <span className="text-4xl">{getFileIcon(file.type)}</span>
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-2">
                  <h5 className="font-medium text-[#2C1A0E] text-sm truncate" title={file.name}>
                    {file.name}
                  </h5>
                  <div className="flex justify-between text-xs text-[#5D3A1F]">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{file.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.name)}
                    className="w-full text-red-600 hover:text-red-800 text-sm py-1 relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              {uploading ? `Enviando... ${Math.round(uploadProgress)}%` : `Enviar ${selectedFiles.length} arquivo(s)`}
            </button>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FFD700] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-[#2C1A0E] text-green-700">
            ✅ Arquivos Enviados com Sucesso ({uploadedFiles.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="glass-card p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="space-y-2">
                  <h5 className="font-medium text-green-800 text-sm flex items-center">
                    <span className="mr-2">{getFileIcon(file.type)}</span>
                    {file.name}
                  </h5>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>{formatFileSize(file.size)}</span>
                    <span>✅ Enviado</span>
                  </div>
                  
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center text-green-700 hover:text-green-900 text-sm py-1 underline relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Ver arquivo
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}