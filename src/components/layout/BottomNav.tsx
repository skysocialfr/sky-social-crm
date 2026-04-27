import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/app',           label: 'Dashboard', emoji: '◉',  end: true  },
  { to: '/app/prospects', label: 'Prospects', emoji: '👥', end: false },
  { to: '/app/relances',  label: 'Relances',  emoji: '🔔', end: false },
  { to: '/app/journal',   label: 'Journal',   emoji: '📓', end: false },
  { to: '/app/settings',  label: 'Params',    emoji: '⚙️', end: false },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#e4e7f8] bg-white flex">
      {NAV.map(({ to, label, emoji, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#6366f1]' : 'text-[#9ca3af]'
            )
          }
        >
          <span className="text-[18px] leading-none">{emoji}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
