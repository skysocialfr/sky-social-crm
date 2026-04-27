import { useState } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ShieldCheck, Shield, ShieldOff, LogIn } from 'lucide-react'
import { useAdminProfiles, useSuspendUser } from '@/hooks/useUserProfile'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/cn'

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminProfiles()
  const suspend = useSuspendUser()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleSuspend = async (userId: string, currentlySuspended: boolean) => {
    setLoadingId(userId)
    try {
      await suspend.mutateAsync({ userId, suspended: !currentlySuspended })
      toast(currentlySuspended ? 'Compte réactivé.' : 'Compte suspendu.')
    } catch {
      toast('Erreur lors de la mise à jour.')
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Utilisateurs</h1>
        <p className="text-sm text-gray-400 mt-0.5">{users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="rounded-2xl border border-[#e4e7f8] bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e4e7f8] text-xs text-gray-400">
              <th className="px-5 py-3 text-left font-semibold">Utilisateur</th>
              <th className="px-5 py-3 text-left font-semibold">Rôle</th>
              <th className="px-5 py-3 text-left font-semibold">Plan</th>
              <th className="px-5 py-3 text-left font-semibold">Prospects</th>
              <th className="px-5 py-3 text-left font-semibold">Dernière connexion</th>
              <th className="px-5 py-3 text-left font-semibold">Inscrit</th>
              <th className="px-5 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                className={cn(
                  'border-b border-[#e4e7f8] last:border-0 hover:bg-gray-50 transition-colors',
                  u.suspended && 'opacity-60'
                )}
              >
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {u.company_name || <span className="italic text-gray-400">Sans nom</span>}
                      {u.suspended && <span className="ml-2 text-[10px] text-red-500 font-semibold">SUSPENDU</span>}
                    </p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                      <ShieldCheck size={10} /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      <Shield size={10} /> Client
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.subscription_status === 'active' ? (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Pro</span>
                  ) : u.subscription_status === 'past_due' ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">En retard</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Gratuit</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500 text-center">{u.prospect_count ?? 0}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {u.last_sign_in_at
                    ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true, locale: fr })
                    : <span className="italic">Jamais</span>}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(parseISO(u.created_at), 'd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {!u.is_admin && (
                      <>
                        <button
                          onClick={() => handleToggleSuspend(u.id, u.suspended)}
                          disabled={loadingId === u.id}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50',
                            u.suspended
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          )}
                        >
                          <ShieldOff size={11} />
                          {loadingId === u.id ? '…' : u.suspended ? 'Réactiver' : 'Suspendre'}
                        </button>
                        <button
                          title="Impersonate (bientôt disponible)"
                          disabled
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-400 cursor-not-allowed"
                        >
                          <LogIn size={11} />
                          Impersonate
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Aucun utilisateur.</div>
        )}
      </div>
    </div>
  )
}
