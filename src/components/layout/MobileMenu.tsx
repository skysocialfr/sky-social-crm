import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { useRelances } from '@/hooks/useRelances'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { dicebearAvatar } from '@/lib/avatar'
import { cn } from '@/lib/cn'

// Mobile-only side drawer that mirrors the desktop sidebar but adds
// the Settings + Admin entries that don't fit the 5-slot BottomNav.
// Triggered by the hamburger button on the TopBar.

const NAV = [
  { to: '/app',           label: 'Tableau de bord', emoji: '◉',  end: true  },
  { to: '/app/prospects', label: 'Prospects',        emoji: '👥', end: false },
  { to: '/app/relances',  label: 'Relances',         emoji: '🔔', end: false, badge: true },
  { to: '/app/journal',   label: 'Journal',          emoji: '📓', end: false },
  { to: '/app/analytics', label: 'Analytics',        emoji: '📊', end: false },
  { to: '/app/settings',  label: 'Paramètres',       emoji: '⚙️', end: false },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { profile } = useTheme()
  const { data: relances } = useRelances()
  const { isAdmin } = useIsAdmin()
  const overdueCount = relances?.length ?? 0
  const companyName = profile?.company_name || 'Velmio'

  const close = () => setOpen(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="md:hidden flex items-center justify-center w-[34px] h-[34px] rounded-[9px] text-[#6b7280] border border-transparent transition-all hover:bg-[#f7f8ff] hover:border-[#e4e7f8]"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="md:hidden fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menu de navigation</Dialog.Title>

          {/* Logo + close */}
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
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-[#1a1c2e] leading-none truncate">{companyName}</p>
              <p className="text-[10px] text-[#9ca3af] mt-[3px]">CRM Prospection</p>
            </div>
            <Dialog.Close
              aria-label="Fermer le menu"
              className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#6b7280] hover:bg-[#f7f8ff] flex-shrink-0"
            >
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-[10px] flex flex-col gap-[2px] overflow-y-auto">
            {NAV.map(({ to, label, emoji, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-[9px] px-[10px] py-2.5 rounded-[9px] text-[14px] transition-all duration-[130ms] border',
                    isActive
                      ? 'bg-[rgba(99,102,241,0.08)] text-[#6366f1] font-bold border-[rgba(99,102,241,0.2)]'
                      : 'text-[#374151] font-medium border-transparent hover:bg-[rgba(99,102,241,0.05)]'
                  )
                }
              >
                <span className="text-[15px] leading-none flex-shrink-0">{emoji}</span>
                <span className="flex-1">{label}</span>
                {badge && overdueCount > 0 && (
                  <span className="text-[10px] font-bold text-white bg-[#dc2626] rounded-[10px] px-[6px] py-[1px] leading-[1.4] flex-shrink-0">
                    {overdueCount}
                  </span>
                )}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/app/admin"
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'mt-2 flex items-center gap-[9px] px-[10px] py-2.5 rounded-[9px] text-[14px] transition-all duration-[130ms] border',
                    isActive
                      ? 'bg-[rgba(99,102,241,0.08)] text-[#6366f1] font-bold border-[rgba(99,102,241,0.2)]'
                      : 'text-[#374151] font-medium border-transparent hover:bg-[rgba(99,102,241,0.05)]'
                  )
                }
              >
                <span className="text-[15px] leading-none flex-shrink-0">🛡️</span>
                <span className="flex-1">Administration</span>
              </NavLink>
            )}
          </nav>

          {/* Footer user */}
          <div className="flex items-center gap-[10px] px-4 py-3 border-t border-[#e4e7f8]">
            <img
              src={dicebearAvatar(user?.email ?? 'user')}
              alt=""
              className="w-9 h-9 rounded-[9px] flex-shrink-0 bg-[#f0f1f8]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#1a1c2e] truncate">
                {profile?.company_name ?? user?.email?.split('@')[0] ?? 'Utilisateur'}
              </p>
              <p className="text-[10px] text-[#9ca3af] truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { close(); logout() }}
              aria-label="Se déconnecter"
              className="flex items-center justify-center w-[32px] h-[32px] rounded-[8px] text-[#6b7280] border border-transparent transition-all hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fecaca] flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
