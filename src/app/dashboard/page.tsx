import DashboardLayout from '@/components/DashboardLayout'
import DashboardContent from '@/components/DashboardContent'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}