import { useMemo } from 'react'
import { parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DollarSign, TrendingUp, XCircle, Clock } from 'lucide-react'
import { useAdminProfiles } from '@/hooks/useUserProfile'

const PRO_PRICE = 9

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-[#e4e7f8] bg-white p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function AdminBilling() {
  const { data: users = [], isLoading } = useAdminProfiles()

  const stats = useMemo(() => {
    const active = users.filter(u => u.subscription_status === 'active')
    const cancelled = users.filter(u => u.subscription_status === 'cancelled')
    const pastDue = users.filter(u => u.subscription_status === 'past_due')
    return {
      mrr: active.length * PRO_PRICE,
      arr: active.length * PRO_PRICE * 12,
      active: active.length,
      cancelled: cancelled.length,
      pastDue: pastDue.length,
      users,
    }
  }, [users])

  const subscribed = users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'past_due')

  if (isLoading) {
    return <div className="space-y-4 animate-pulse"><div className="h-24 rounded-2xl bg-gray-100" /></div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Facturation</h1>
        <p className="text-sm text-gray-400 mt-0.5">Revenus et abonnements</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={18} className="text-indigo-600" />} label="MRR" value={`${stats.mrr}€`} color="bg-indigo-50" />
        <StatCard icon={<TrendingUp size={18} className="text-emerald-600" />} label="ARR" value={`${stats.arr}€`} color="bg-emerald-50" />
        <StatCard icon={<XCircle size={18} className="text-red-500" />} label="Annulés" value={stats.cancelled} color="bg-red-50" />
        <StatCard icon={<Clock size={18} className="text-amber-600" />} label="En retard" value={stats.pastDue} color="bg-amber-50" />
      </div>

      {/* Plan distribution */}
      <div className="rounded-2xl border border-[#e4e7f8] bg-white p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Répartition des plans</h2>
        <div className="space-y-3">
          {[
            { label: 'Pro (actif)', count: stats.active, color: 'bg-indigo-500' },
            { label: 'En retard', count: stats.pastDue, color: 'bg-amber-400' },
            { label: 'Annulé', count: stats.cancelled, color: 'bg-red-400' },
            { label: 'Gratuit', count: users.length - stats.active - stats.pastDue - stats.cancelled, color: 'bg-gray-300' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: users.length > 0 ? `${(row.count / users.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribers table */}
      <div className="rounded-2xl border border-[#e4e7f8] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e4e7f8]">
          <h2 className="text-sm font-bold text-gray-900">Abonnés actifs</h2>
        </div>
        {subscribed.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Aucun abonné pour le moment.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4e7f8] text-xs text-gray-400">
                <th className="px-5 py-3 text-left font-semibold">Société</th>
                <th className="px-5 py-3 text-left font-semibold">Email</th>
                <th className="px-5 py-3 text-left font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">MRR</th>
                <th className="px-5 py-3 text-left font-semibold">Inscrit</th>
              </tr>
            </thead>
            <tbody>
              {subscribed.map(u => (
                <tr key={u.id} className="border-b border-[#e4e7f8] last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.company_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.subscription_status === 'active' ? (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Actif</span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">En retard</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">{PRO_PRICE}€</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {format(parseISO(u.created_at), 'd MMM yyyy', { locale: fr })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
