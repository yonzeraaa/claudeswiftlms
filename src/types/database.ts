// Database types for SwiftEDU
// Generated based on the Supabase schema

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'student' | 'instructor'
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  instructor_id?: string
  category?: string
  level?: 'Iniciante' | 'Intermediário' | 'Avançado'
  duration_hours?: number
  price?: number
  thumbnail_url?: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content?: string
  video_url?: string
  duration_minutes?: number
  order_index: number
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  progress_percentage: number
  status: 'active' | 'completed' | 'dropped'
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  watch_time_seconds: number
}

export interface Assessment {
  id: string
  course_id: string
  title: string
  description?: string
  type: 'quiz' | 'exam' | 'assignment'
  max_attempts: number
  time_limit_minutes?: number
  passing_score: number
  created_at: string
}

export interface Question {
  id: string
  assessment_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'essay'
  options?: Record<string, unknown> // JSONB for multiple choice options
  correct_answer?: string
  points: number
  order_index: number
}

export interface AssessmentSubmission {
  id: string
  student_id: string
  assessment_id: string
  answers: Record<string, unknown> // JSONB
  score?: number
  max_score?: number
  submitted_at: string
  graded_at?: string
  graded_by?: string
  attempt_number: number
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  issued_at: string
  certificate_url?: string
  verification_code?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  event_type: 'class' | 'exam' | 'assignment_due' | 'meeting'
  start_datetime: string
  end_datetime?: string
  course_id?: string
  created_by?: string
  created_at: string
}

export interface Task {
  id: string
  student_id: string
  course_id?: string
  title: string
  description?: string
  due_date?: string
  completed: boolean
  completed_at?: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value?: Record<string, unknown> // JSONB
  description?: string
  updated_at: string
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>
      }
      course_modules: {
        Row: CourseModule
        Insert: Omit<CourseModule, 'id' | 'created_at'>
        Update: Partial<Omit<CourseModule, 'id' | 'created_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at'>>
      }
      enrollments: {
        Row: Enrollment
        Insert: Omit<Enrollment, 'id' | 'enrolled_at'>
        Update: Partial<Omit<Enrollment, 'id' | 'enrolled_at'>>
      }
      lesson_progress: {
        Row: LessonProgress
        Insert: Omit<LessonProgress, 'id'>
        Update: Partial<Omit<LessonProgress, 'id'>>
      }
      assessments: {
        Row: Assessment
        Insert: Omit<Assessment, 'id' | 'created_at'>
        Update: Partial<Omit<Assessment, 'id' | 'created_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id'>
        Update: Partial<Omit<Question, 'id'>>
      }
      assessment_submissions: {
        Row: AssessmentSubmission
        Insert: Omit<AssessmentSubmission, 'id' | 'submitted_at'>
        Update: Partial<Omit<AssessmentSubmission, 'id' | 'submitted_at'>>
      }
      certificates: {
        Row: Certificate
        Insert: Omit<Certificate, 'id' | 'issued_at'>
        Update: Partial<Omit<Certificate, 'id' | 'issued_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      system_settings: {
        Row: SystemSetting
        Insert: Omit<SystemSetting, 'id' | 'updated_at'>
        Update: Partial<Omit<SystemSetting, 'id' | 'updated_at'>>
      }
    }
  }
}