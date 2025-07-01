'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFiles, deleteFile, getStorageStats, formatFileSize, UploadedFile } from '@/lib/storage'
import { getAllCourses, Course } from '@/lib/courses'
import FileUploader from './FileUploader'
import VideoPlayer from './VideoPlayer'

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState('upload')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedLesson, setSelectedLesson] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalFiles?: number; totalSize?: number; byType?: Record<string, { count: number; size: number }>; byCourse?: Record<string, { count: number; size: number }> }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [organizationMode, setOrganizationMode] = useState<'list' | 'grid' | 'organized'>('grid')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [coursesData, filesData, statsData] = await Promise.all([
        getAllCourses(),
        getFiles({
          courseId: selectedCourse || undefined,
          type: selectedFileType || undefined
        }),
        getStorageStats()
      ])

      setCourses(coursesData)
      setFiles(filesData)
      setStats(statsData)
    } catch {
      setFiles([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }, [selectedCourse, selectedFileType])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUploadComplete = (uploadedFiles: UploadedFile[]) => {
    setFiles(prev => [...uploadedFiles, ...prev])
    loadData() // Reload stats
  }

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Deseja realmente excluir este arquivo?')) {
      try {
        await deleteFile(fileId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
        loadData() // Reload stats
      } catch {
        alert('Erro ao excluir arquivo')
      }
    }
  }

  const handlePreview = (file: UploadedFile) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('document')) return '📝'
    return '📎'
  }

  const renderFileGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map((file) => (
        <div key={file.id} className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
          {/* Preview */}
          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-800 relative group">
            {file.type.startsWith('image/') ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">{getFileIcon(file.type)}</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePreview(file)}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Visualizar"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
              <a
                href={file.url}
                download={file.name}
                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Download"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </a>
              <button
                onClick={() => handleDeleteFile(file.id)}
                className="p-2 bg-red-500/70 rounded-full text-white hover:bg-red-600/70 transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Excluir"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white text-sm truncate" title={file.name}>
              {file.name}
            </h5>
            <div className="flex justify-between text-xs text-slate-300">
              <span>{formatFileSize(file.size)}</span>
              <span>{file.type.split('/')[1]?.toUpperCase()}</span>
            </div>
            <div className="text-xs text-slate-400">
              {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderFileList = () => (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border-2 border-sky-400/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-sky-500/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Arquivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Tamanho
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-sky-500/10">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">{getFileIcon(file.type)}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{file.name}</div>
                      {file.course_id && (
                        <div className="text-xs text-slate-400">
                          Curso: {courses.find(c => c.id === file.course_id)?.title || 'Desconhecido'}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {file.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handlePreview(file)}
                    className="text-sky-400 hover:text-sky-300 relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Ver
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-emerald-400 hover:text-emerald-300 relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-red-400 hover:text-red-300 relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white font-montserrat">
          Gestão de Conteúdo
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative z-50 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-sky-600 text-white border border-amber-400/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-sky-600/20 hover:text-white'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative z-50 cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-sky-600 text-white border border-amber-400/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-sky-600/20 hover:text-white'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            🗂️ Gerenciar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative z-50 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-sky-600 text-white border border-amber-400/30'
                : 'bg-slate-800/70 text-slate-300 hover:bg-sky-600/20 hover:text-white'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            📊 Estatísticas
          </button>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
            <h3 className="text-lg font-semibold text-white mb-4">Selecionar Destino</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="p-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <option value="">Upload Geral</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              
              <input
                type="text"
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                placeholder="ID da Lição (opcional)"
                className="p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          {/* File Uploader */}
          <FileUploader
            courseId={selectedCourse}
            lessonId={selectedLesson}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
              
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="p-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <option value="">Todos os cursos</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>

              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="p-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <option value="">Todos os tipos</option>
                <option value="video">Vídeos</option>
                <option value="image">Imagens</option>
                <option value="application">Documentos</option>
              </select>

              <select
                value={organizationMode}
                onChange={(e) => setOrganizationMode(e.target.value as 'list' | 'grid' | 'organized')}
                className="p-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <option value="grid">Grade</option>
                <option value="list">Lista</option>
                <option value="organized">Organizado</option>
              </select>
            </div>
          </div>

          {/* Files Display */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mx-auto"></div>
              <p className="text-slate-300 mt-2">Carregando arquivos...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhum arquivo encontrado</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                  {filteredFiles.length} arquivo(s) encontrado(s)
                </h3>
              </div>
              
              {organizationMode === 'grid' ? renderFileGrid() : renderFileList()}
            </>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
              <h3 className="text-2xl font-bold text-white">{stats.totalFiles || 0}</h3>
              <p className="text-slate-300">Total de Arquivos</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
              <h3 className="text-2xl font-bold text-white">{formatFileSize(stats.totalSize || 0)}</h3>
              <p className="text-slate-300">Espaço Usado</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
              <h3 className="text-2xl font-bold text-white">{Object.keys(stats.byType || {}).length}</h3>
              <p className="text-slate-300">Tipos de Arquivo</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
              <h3 className="text-2xl font-bold text-white">{Object.keys(stats.byCourse || {}).length}</h3>
              <p className="text-slate-300">Cursos com Conteúdo</p>
            </div>
          </div>

          {/* Type Distribution */}
          {stats.byType && (
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
              <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Tipo</h3>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, data]: [string, { count: number; size: number }]) => (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(type)}</span>
                      <div>
                        <span className="font-medium text-white">{type.toUpperCase()}</span>
                        <p className="text-sm text-slate-400">{data.count} arquivo(s)</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-300">{formatFileSize(data.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-sky-400/30">
            <div className="p-4 border-b border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">{previewFile.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-white relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {previewFile.type.startsWith('video/') ? (
                <VideoPlayer
                  src={previewFile.url}
                  title={previewFile.name}
                />
              ) : previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              ) : previewFile.type.includes('pdf') ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[60vh]"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl">{getFileIcon(previewFile.type)}</span>
                  <p className="text-slate-400 mt-4">Preview não disponível para este tipo de arquivo</p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="mt-4 inline-block bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors relative z-50 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Baixar Arquivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}