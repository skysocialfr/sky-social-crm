import { useState, useMemo } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { useAdminProfiles } from '@/hooks/useUserProfile'

export default function AdminOrgs() {
  const { data: orgs = [], isLoading } = useAdminProfiles()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro'>('all')

  const filtered = useMemo(() => {
    return orgs.filter(o => {
      if (planFilter === 'pro' && o.subscription_status !== 'active') return false
      if (planFilter === 'free' && o.subscription_status === 'active') return false
      if (search) {
        const q = search.toLowerCase()
        if (!o.company_name?.toLowerCase().includes(q) && !o.email.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [orgs, search, planFilter])

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Organisations</h1>
        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} espace{filtered.length !== 1 ? 's' : ''} CRM</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-xl border border-[#e4e7f8] bg-white pl-8 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none w-48"
          />
        </div>
        {(['all', 'free', 'pro'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPlanFilter(p)}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${planFilter === p ? 'bg-indigo-600 text-white' : 'border border-[#e4e7f8] bg-white text-gray-600 hover:border-indigo-300'}`}
          >
            {p === 'all' ? 'Tous' : p === 'pro' ? 'Pro' : 'Gratuit'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#e4e7f8] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e4e7f8] text-xs text-gray-400">
              <th className="px-5 py-3 text-left font-semibold">Organisation</th>
              <th className="px-5 py-3 text-left font-semibold">Email</th>
              <th className="px-5 py-3 text-left font-semibold">Plan</th>
              <th className="px-5 py-3 text-left font-semibold">Prospects</th>
              <th className="px-5 py-3 text-left font-semibold">Dernière activité</th>
              <th className="px-5 py-3 text-left font-semibold">Créé le</th>
              <th className="px-5 py-3 text-left font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-[#e4e7f8] last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {o.logo_url ? (
                      <img src={o.logo_url} alt="" className="h-7 w-7 rounded object-contain border border-[#e4e7f8]" />
                    ) : (
                      <div className="h-7 w-7 rounded flex-shrink-0 bg-indigo-100" style={{ background: o.primary_color ? `hsl(${o.primary_color})` : '#e0e7ff' }} />
                    )}
                    <span className="font-medium text-gray-900">
                      {o.company_name || <span className="italic text-gray-400">Sans nom</span>}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{o.email}</td>
                <td className="px-5 py-3">
                  {o.subscription_status === 'active' ? (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Pro</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Gratuit</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500 text-center">{o.prospect_count ?? 0}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {o.last_sign_in_at
                    ? formatDistanceToNow(new Date(o.last_sign_in_at), { addSuffix: true, locale: fr })
                    : <span className="italic">Jamais</span>}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(parseISO(o.created_at), 'd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-5 py-3">
                  {o.suspended ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Suspendu</span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Actif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Aucune organisation trouvée.</div>
        )}
      </div>
    </div>
  )
}
