import { useLocation, useNavigate } from 'react-router-dom'
import { useRelances } from '@/hooks/useRelances'
import { useAuth } from '@/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  '/app':             'Tableau de bord',
  '/app/prospects':   'Prospects',
  '/app/relances':    'Relances',
  '/app/journal':     'Journal',
  '/app/analytics':   'Analytics',
  '/app/settings':    'Paramètres',
  '/app/admin':       'Administration',
}

interface Props {
  onSearchOpen: () => void
}

export default function TopBar({ onSearchOpen }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: relances } = useRelances()
  const { logout } = useAuth()
  const overdueCount = relances?.length ?? 0

  const title = PAGE_TITLES[location.pathname] ?? 'Sky Social CRM'

  return (
    <header
      className="flex h-[52px] items-center gap-[10px] px-4 md:px-5 flex-shrink-0 bg-white border-b border-[#e4e7f8]"
      style={{ zIndex: 10 }}
    >
      {/* Breadcrumb — hidden on mobile */}
      <span className="hidden md:inline text-[12px] text-[#9ca3af]">Sky Social</span>
      <span className="hidden md:inline text-[12px] text-[#9ca3af]">›</span>
      <span className="text-[13px] font-bold text-[#1a1c2e]">{title}</span>

      {/* Search — full on desktop, icon-only on mobile */}
      <button
        onClick={onSearchOpen}
        className="ml-auto flex items-center gap-2 bg-[#f7f8ff] border border-[#e4e7f8] rounded-[9px] px-[10px] md:px-[14px] py-[6px] text-[12px] text-[#9ca3af] transition-all hover:bg-[#eef0ff] hover:text-[#6b7280] cursor-pointer"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="hidden md:inline">Rechercher…</span>
        <span className="hidden md:inline bg-[#e4e7f8] rounded-[4px] px-[5px] py-[1px] text-[10px] text-[#6b7280] font-mono">⌘K</span>
      </button>

      {/* Bell */}
      <button
        onClick={() => navigate('/app/relances')}
        className="relative flex items-center justify-center w-[34px] h-[34px] rounded-[9px] text-[#6b7280] border border-transparent transition-all hover:bg-[#f7f8ff] hover:border-[#e4e7f8]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {overdueCount > 0 && (
          <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-[#dc2626] border-[1.5px] border-white" />
        )}
      </button>

      {/* Logout */}
      <button
        onClick={() => logout()}
        title="Se déconnecter"
        aria-label="Se déconnecter"
        className="flex items-center justify-center w-[34px] h-[34px] rounded-[9px] text-[#6b7280] border border-transparent transition-all hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fecaca]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </header>
  )
}
