import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, CreditCard, Settings, Mail, Megaphone, ArrowLeft, Shield } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/admin',           label: 'Dashboard',      icon: LayoutDashboard, end: true },
  { to: '/admin/orgs',      label: 'Organisations',  icon: Building2 },
  { to: '/admin/users',     label: 'Utilisateurs',   icon: Users },
  { to: '/admin/billing',   label: 'Facturation',    icon: CreditCard },
  { to: '/admin/config',    label: 'Configuration',  icon: Settings },
  { to: '/admin/emails',    label: 'Emails',         icon: Mail },
  { to: '/admin/changelog', label: 'Changelog',      icon: Megaphone },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-gray-950 text-white flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Sky Social</p>
            <p className="text-[10px] text-gray-400 leading-tight">Console Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back to app */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('/app')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/8 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Retour à l'app
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#f4f6ff]">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-[#e4e7f8] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-indigo-600" />
            <span className="text-sm font-bold text-gray-900">Admin</span>
            <span className="mx-1 text-gray-300">·</span>
            <span className="text-xs text-gray-400">Console interne</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
            Super Admin
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
