import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/prospects', label: 'Prospects', icon: Users },
  { to: '/relances', label: 'Relances', icon: Bell },
]

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap size={16} className="text-primary-foreground" fill="currentColor" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">Sky Social</p>
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
