import { useMemo } from 'react'
import { format, subDays, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAdminProfiles } from '@/hooks/useUserProfile'
import { TrendingUp, Users, DollarSign, AlertTriangle, UserPlus } from 'lucide-react'

const PRO_PRICE = 9

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-2xl border border-[#e4e7f8] bg-white p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: users = [], isLoading } = useAdminProfiles()

  const stats = useMemo(() => {
    const now = new Date()
    const cutoff30 = subDays(now, 30)
    const cutoff7 = subDays(now, 7)

    const active = users.filter(u => !u.suspended)
    const proUsers = users.filter(u => u.subscription_status === 'active')
    const newLast30 = users.filter(u => isAfter(parseISO(u.created_at), cutoff30))
    const newLast7 = users.filter(u => isAfter(parseISO(u.created_at), cutoff7))
    const cancelled = users.filter(u => u.subscription_status === 'cancelled')
    const suspended = users.filter(u => u.suspended)
    const mrr = proUsers.length * PRO_PRICE
    const churnRate = users.length > 0 ? Math.round((cancelled.length / users.length) * 100) : 0

    return { total: users.length, active: active.length, proUsers: proUsers.length, mrr, newLast30: newLast30.length, newLast7: newLast7.length, cancelled: cancelled.length, churnRate, suspended: suspended.length }
  }, [users])

  const recent = useMemo(() =>
    [...users]
      .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
      .slice(0, 8),
    [users]
  )

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100" />)}
        </div>
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de la plateforme</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={18} className="text-indigo-600" />}
          label="MRR"
          value={`${stats.mrr}€`}
          sub={`${stats.proUsers} abonnés Pro`}
          color="bg-indigo-50"
        />
        <StatCard
          icon={<Users size={18} className="text-emerald-600" />}
          label="Utilisateurs"
          value={stats.total}
          sub={`${stats.active} actifs`}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<UserPlus size={18} className="text-violet-600" />}
          label="Inscrits 30j"
          value={stats.newLast30}
          sub={`dont ${stats.newLast7} cette semaine`}
          color="bg-violet-50"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-amber-600" />}
          label="Churn"
          value={`${stats.churnRate}%`}
          sub={`${stats.cancelled} annulés`}
          color="bg-amber-50"
        />
      </div>

      {/* Alerts */}
      {stats.suspended > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {stats.suspended} compte{stats.suspended > 1 ? 's' : ''} suspendu{stats.suspended > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ARPU', value: stats.total > 0 ? `${(stats.mrr / stats.total).toFixed(1)}€` : '—' },
          { label: 'Plan Pro', value: `${stats.total > 0 ? Math.round((stats.proUsers / stats.total) * 100) : 0}%` },
          { label: 'Suspendus', value: stats.suspended },
          { label: 'Total prospects', value: users.reduce((s, u) => s + (u.prospect_count ?? 0), 0) },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[#e4e7f8] bg-white p-4 text-center">
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      <div className="rounded-2xl border border-[#e4e7f8] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e4e7f8]">
          <h2 className="text-sm font-bold text-gray-900">Dernières inscriptions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e4e7f8] text-xs text-gray-400">
              <th className="px-5 py-3 text-left font-semibold">Société</th>
              <th className="px-5 py-3 text-left font-semibold">Email</th>
              <th className="px-5 py-3 text-left font-semibold">Plan</th>
              <th className="px-5 py-3 text-left font-semibold">Prospects</th>
              <th className="px-5 py-3 text-left font-semibold">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(u => (
              <tr key={u.id} className="border-b border-[#e4e7f8] last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">
                  {u.company_name || <span className="italic text-gray-400">Sans nom</span>}
                  {u.suspended && <span className="ml-2 text-[10px] text-red-500 font-semibold">SUSPENDU</span>}
                </td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  {u.subscription_status === 'active' ? (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Pro</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Gratuit</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{u.prospect_count ?? 0}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(parseISO(u.created_at), 'd MMM yyyy', { locale: fr })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recent.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Aucun utilisateur</div>
        )}
      </div>
    </div>
  )
}
