'use client'

import StudentDashboardLayout from '@/components/StudentDashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function StudentDashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardLayout />
    </ProtectedRoute>
  )
}