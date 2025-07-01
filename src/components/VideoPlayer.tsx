'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface VideoPlayerProps {
  src: string
  title?: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
  autoSaveProgress?: boolean
  userId?: string
  lessonId?: string
}

interface VideoNote {
  id: string
  timestamp: number
  text: string
  color: string
}

interface Bookmark {
  id: string
  timestamp: number
  title: string
}

export default function VideoPlayer({ 
  src, 
  title, 
  onProgress, 
  onComplete, 
  autoSaveProgress = true,
  userId,
  lessonId 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [notes, setNotes] = useState<VideoNote[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [newNote, setNewNote] = useState('')
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  const [selectedNoteColor, setSelectedNoteColor] = useState('#FFD700')
  const [showSubtitles, setShowSubtitles] = useState(false)
  const [quality, setQuality] = useState('auto')

  let controlsTimeout: NodeJS.Timeout

  const loadProgress = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('lesson_progress')
        .select('progress_percentage, last_position')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (data?.last_position && videoRef.current) {
        videoRef.current.currentTime = data.last_position
      }
    } catch {
      // Progress not found
    }
  }, [userId, lessonId])

  const loadNotesAndBookmarks = useCallback(async () => {
    if (!userId || !lessonId) return

    try {
      const [notesData, bookmarksData] = await Promise.all([
        supabase
          .from('video_notes')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .order('timestamp'),
        supabase
          .from('video_bookmarks')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .order('timestamp')
      ])

      setNotes(notesData.data || [])
      setBookmarks(bookmarksData.data || [])
    } catch {
      // Error loading data
    }
  }, [userId, lessonId])

  useEffect(() => {
    if (autoSaveProgress && userId && lessonId) {
      loadProgress()
      loadNotesAndBookmarks()
    }
  }, [autoSaveProgress, userId, lessonId, loadProgress, loadNotesAndBookmarks])


  const saveProgress = async (currentPos: number, progressPercentage: number) => {
    if (!autoSaveProgress || !userId || !lessonId) return

    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          progress_percentage: progressPercentage,
          last_position: currentPos,
          updated_at: new Date().toISOString()
        })
    } catch {
      // Error saving progress
    }
  }


  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return

    const current = videoRef.current.currentTime
    const total = videoRef.current.duration

    setCurrentTime(current)
    
    if (total > 0) {
      const progressPercentage = (current / total) * 100
      onProgress?.(progressPercentage)
      
      if (autoSaveProgress) {
        saveProgress(current, progressPercentage)
      }

      if (progressPercentage >= 95) {
        onComplete?.()
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVolume
    setVolume(newVolume)
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const addNote = async () => {
    if (!newNote.trim() || !userId || !lessonId) return

    const note: VideoNote = {
      id: Date.now().toString(),
      timestamp: currentTime,
      text: newNote,
      color: selectedNoteColor
    }

    try {
      const { data } = await supabase
        .from('video_notes')
        .insert([{
          user_id: userId,
          lesson_id: lessonId,
          timestamp: note.timestamp,
          text: note.text,
          color: note.color
        }])
        .select()
        .single()

      if (data) {
        setNotes(prev => [...prev, { ...note, id: data.id }])
        setNewNote('')
      }
    } catch {
      // Error adding note
    }
  }

  const addBookmark = async () => {
    if (!newBookmarkTitle.trim() || !userId || !lessonId) return

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      timestamp: currentTime,
      title: newBookmarkTitle
    }

    try {
      const { data } = await supabase
        .from('video_bookmarks')
        .insert([{
          user_id: userId,
          lesson_id: lessonId,
          timestamp: bookmark.timestamp,
          title: bookmark.title
        }])
        .select()
        .single()

      if (data) {
        setBookmarks(prev => [...prev, { ...bookmark, id: data.id }])
        setNewBookmarkTitle('')
      }
    } catch {
      // Error adding bookmark
    }
  }

  const jumpToTime = (timestamp: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = timestamp
    setCurrentTime(timestamp)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const hideControlsWithDelay = () => {
    clearTimeout(controlsTimeout)
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    hideControlsWithDelay()
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto max-h-[70vh] object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onMouseMove={showControlsTemporarily}
        onClick={handlePlayPause}
        crossOrigin="anonymous"
      >
        {showSubtitles && (
          <track
            kind="captions"
            src="/subtitles.vtt"
            srcLang="pt"
            label="Português"
            default
          />
        )}
      </video>

      {/* Video Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}

      {/* Quality Selector */}
      <div className="absolute top-4 right-4">
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm border-none relative z-50 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <option value="auto">Auto</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
          <option value="360p">360p</option>
        </select>
      </div>

      {/* Video Notes Markers */}
      <div className="absolute bottom-16 left-0 right-0 h-1">
        {notes.map(note => (
          <div
            key={note.id}
            className="absolute w-2 h-4 cursor-pointer transform -translate-x-1"
            style={{
              left: `${(note.timestamp / duration) * 100}%`,
              backgroundColor: note.color
            }}
            onClick={() => jumpToTime(note.timestamp)}
            title={note.text}
          />
        ))}
      </div>

      {/* Bookmark Markers */}
      <div className="absolute bottom-14 left-0 right-0 h-1">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="absolute w-2 h-4 bg-blue-500 cursor-pointer transform -translate-x-1"
            style={{ left: `${(bookmark.timestamp / duration) * 100}%` }}
            onClick={() => jumpToTime(bookmark.timestamp)}
            title={bookmark.title}
          />
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[#FFD700] rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFD700] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-[#FFD700] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
                  className="text-white hover:text-[#FFD700] transition-colors relative z-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  {volume > 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 accent-[#FFD700]"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                className="bg-black/50 text-white px-2 py-1 rounded text-sm border-none relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notes Button */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-white hover:text-[#FFD700] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Anotações"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>

              {/* Bookmarks Button */}
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="text-white hover:text-[#FFD700] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
                title="Marcadores"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>

              {/* Subtitles Button */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`transition-colors relative z-50 cursor-pointer ${
                  showSubtitles ? 'text-[#FFD700]' : 'text-white hover:text-[#FFD700]'
                }`}
                style={{ pointerEvents: 'auto' }}
                title="Legendas"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
                </svg>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#FFD700] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="absolute top-0 right-0 w-80 h-full bg-black/90 text-white p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Anotações</h3>
            <button
              onClick={() => setShowNotes(false)}
              className="text-white hover:text-red-400 relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              ✕
            </button>
          </div>

          {/* Add Note */}
          <div className="mb-4 space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Digite sua anotação..."
              className="w-full p-2 bg-white/10 rounded border border-white/20 text-white resize-none"
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedNoteColor}
                onChange={(e) => setSelectedNoteColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <button
                onClick={addNote}
                className="flex-1 bg-[#FFD700] text-black px-3 py-2 rounded hover:bg-[#B8860B] transition-colors relative z-50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Adicionar em {formatTime(currentTime)}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => jumpToTime(note.timestamp)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                  <span className="text-xs text-white/70">
                    {formatTime(note.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <div className="absolute top-0 left-0 w-80 h-full bg-black/90 text-white p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Marcadores</h3>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-white hover:text-red-400 relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              ✕
            </button>
          </div>

          {/* Add Bookmark */}
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Título do marcador..."
              className="w-full p-2 bg-white/10 rounded border border-white/20 text-white"
            />
            <button
              onClick={addBookmark}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors relative z-50 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              Marcar em {formatTime(currentTime)}
            </button>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="p-3 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => jumpToTime(bookmark.timestamp)}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs text-white/70">
                    {formatTime(bookmark.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-medium">{bookmark.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}