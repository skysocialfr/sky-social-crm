import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Tableau de bord',
  '/prospects': 'Prospects',
  '/relances': 'Relances',
}

export default function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const title = PAGE_TITLES[location.pathname] ?? 'Sky Social CRM'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
            <User size={13} className="text-primary" />
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  )
}
