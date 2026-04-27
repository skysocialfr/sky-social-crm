import { createHashRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { useTheme } from '@/context/ThemeContext'
import AppShell from '@/components/layout/AppShell'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ProspectsPage from '@/pages/ProspectsPage'
import ProspectDetailPage from '@/pages/ProspectDetailPage'
import RelancesPage from '@/pages/RelancesPage'
import JournalPage from '@/pages/JournalPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import AdminPage from '@/pages/AdminPage'
import NotFoundPage from '@/pages/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const { profile, isLoading: profileLoading } = useTheme()
  if (loading || profileLoading) return (
    <div className="flex h-screen items-center justify-center text-[#6b7280] text-sm">Chargement…</div>
  )
  if (!session) return <Navigate to="/login" replace />
  if (profile?.suspended) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#f4f6ff] text-center px-6">
        <p className="text-lg font-semibold text-[#1a1c2e]">Compte suspendu</p>
        <p className="text-sm text-[#6b7280] max-w-sm">Votre accès a été temporairement suspendu. Contactez l'administrateur.</p>
      </div>
    )
  }
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useIsAdmin()
  if (authLoading || adminLoading) return (
    <div className="flex h-screen items-center justify-center text-[#6b7280] text-sm">Chargement…</div>
  )
  if (!session) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/app" replace />
  return <>{children}</>
}

export const router = createHashRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'prospects', element: <ProspectsPage /> },
      { path: 'prospects/:id', element: <ProspectDetailPage /> },
      { path: 'relances', element: <RelancesPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
