import { createHashRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProspectsPage from '@/pages/ProspectsPage'
import ProspectDetailPage from '@/pages/ProspectDetailPage'
import RelancesPage from '@/pages/RelancesPage'
import NotFoundPage from '@/pages/NotFoundPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Chargement…</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
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
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
