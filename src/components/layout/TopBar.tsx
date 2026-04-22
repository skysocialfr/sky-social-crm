import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Tableau de bord',
  '/app/prospects': 'Prospects',
  '/app/relances': 'Relances',
  '/app/settings': 'Paramètres',
  '/app/admin': 'Administration',
}

export default function TopBar() {
  const { user, logout } = useAuth()
  const { profile } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const title = PAGE_TITLES[location.pathname] ?? 'SKY CRM'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 overflow-hidden">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={13} className="text-primary" />
            )}
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
        </div>
        <Link
          to="/app/settings"
          className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Paramètres"
        >
          <Settings size={15} />
        </Link>
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
