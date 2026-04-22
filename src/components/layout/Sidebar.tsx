import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, Settings, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useTheme } from '@/context/ThemeContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function Sidebar() {
  const { profile } = useTheme()
  const { isAdmin } = useIsAdmin()

  const companyName = profile?.company_name || 'Sky Social'

  const NAV = [
    { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/app/prospects', label: 'Prospects', icon: Users },
    { to: '/app/relances', label: 'Relances', icon: Bell },
    { to: '/app/settings', label: 'Paramètres', icon: Settings },
    ...(isAdmin ? [{ to: '/app/admin', label: 'Administration', icon: ShieldCheck, end: false }] : []),
  ]

  return (
    <aside className="hidden md:flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        {profile?.logo_url ? (
          <img
            src={profile.logo_url}
            alt={companyName}
            className="h-8 w-8 rounded-lg object-contain border border-border bg-muted"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap size={16} className="text-primary-foreground" fill="currentColor" />
          </div>
        )}
        <div>
          <p className="text-sm font-bold leading-none text-foreground">{companyName}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">CRM Prospection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">Sky Social Agency © 2025</p>
      </div>
    </aside>
  )
}
