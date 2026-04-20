import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/prospects', label: 'Prospects', icon: Users },
  { to: '/relances', label: 'Relances', icon: Bell },
  { to: '/settings', label: 'Paramètres', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card flex">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
