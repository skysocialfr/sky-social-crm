import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { useRelances } from '@/hooks/useRelances'
import { dicebearAvatar } from '@/lib/avatar'

const NAV = [
  { to: '/app',           label: 'Tableau de bord', emoji: '◉',  end: true  },
  { to: '/app/prospects', label: 'Prospects',        emoji: '👥', end: false },
  { to: '/app/relances',  label: 'Relances',         emoji: '🔔', end: false, badge: true },
  { to: '/app/journal',   label: 'Journal',          emoji: '📓', end: false },
  { to: '/app/analytics', label: 'Analytics',        emoji: '📊', end: false, isNew: true },
  { to: '/app/settings',  label: 'Paramètres',       emoji: '⚙️', end: false },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { profile } = useTheme()
  const { data: relances } = useRelances()
  const overdueCount = relances?.length ?? 0
  const companyName = profile?.company_name || 'Sky Social'

  return (
    <aside className="hidden md:flex h-screen w-[220px] flex-col flex-shrink-0 bg-white border-r border-[#e4e7f8]">

      {/* Logo */}
      <div className="flex items-center gap-[10px] px-4 py-[18px] border-b border-[#e4e7f8]">
        {profile?.logo_url ? (
          <img
            src={profile.logo_url}
            alt={companyName}
            className="h-[34px] w-[34px] rounded-[10px] object-contain border border-[#e4e7f8] flex-shrink-0"
          />
        ) : (
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-[#1a1c2e] leading-none truncate">{companyName}</p>
          <p className="text-[10px] text-[#9ca3af] mt-[3px]">CRM Prospection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-[10px] flex flex-col gap-[2px] overflow-y-auto">
        {NAV.map(({ to, label, emoji, end, badge, isNew }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-[9px] px-[10px] py-2 rounded-[9px] text-[13px] transition-all duration-[130ms] border ${
                isActive
                  ? 'bg-[rgba(99,102,241,0.08)] text-[#6366f1] font-bold border-[rgba(99,102,241,0.2)]'
                  : 'text-[#6b7280] font-medium border-transparent hover:bg-[rgba(99,102,241,0.05)] hover:text-[#374151]'
              }`
            }
          >
            <span className="text-[14px] leading-none flex-shrink-0">{emoji}</span>
            <span className="flex-1">{label}</span>
            {badge && overdueCount > 0 && (
              <span className="text-[10px] font-bold text-white bg-[#dc2626] rounded-[10px] px-[6px] py-[1px] leading-[1.4] flex-shrink-0">
                {overdueCount}
              </span>
            )}
            {isNew && (
              <span className="text-[9px] font-extrabold text-[#6366f1] bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-[4px] px-[6px] py-[2px] tracking-[0.06em] flex-shrink-0">
                NEW
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — user */}
      <div className="flex items-center gap-[10px] px-4 py-3 border-t border-[#e4e7f8]">
        <img
          src={dicebearAvatar(user?.email ?? 'user')}
          alt=""
          className="w-8 h-8 rounded-[9px] flex-shrink-0 bg-[#f0f1f8]"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#1a1c2e] truncate">
            {profile?.company_name ?? user?.email?.split('@')[0] ?? 'Utilisateur'}
          </p>
          <p className="text-[10px] text-[#9ca3af] truncate">{user?.email}</p>
        </div>
        <button
          onClick={() => logout()}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#6b7280] border border-transparent transition-all hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fecaca] flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
