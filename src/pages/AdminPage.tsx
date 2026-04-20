import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Shield, ShieldCheck, ShieldOff, Users, Zap } from 'lucide-react'
import { useAdminProfiles, useSuspendUser } from '@/hooks/useUserProfile'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/cn'

function PlanBadge({ status }: { status: string }) {
  if (status === 'active') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
      <Zap size={10} /> Pro
    </span>
  )
  if (status === 'past_due') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-400">
      En attente
    </span>
  )
  if (status === 'cancelled') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      Annulé
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      Gratuit
    </span>
  )
}

export default function AdminPage() {
  const { data: users, isLoading, error } = useAdminProfiles()
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-700 bg-red-900/20 p-6 text-sm text-red-300">
        Erreur de chargement. Vérifiez que votre compte a bien les droits administrateur.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Comptes enregistrés
          <span className="ml-2 text-sm font-normal text-muted-foreground">({users?.length ?? 0})</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d'ensemble de tous les espaces CRM créés sur la plateforme.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Société</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Rôle</th>
              <th className="px-4 py-3 text-left font-medium">
                <span className="flex items-center gap-1"><Users size={11} /> Prospects</span>
              </th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Dernière connexion</th>
              <th className="px-4 py-3 text-left font-medium">Inscrit le</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr
                key={u.id}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/40 transition-colors',
                  u.suspended && 'opacity-60'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.logo_url ? (
                      <img
                        src={u.logo_url}
                        alt={u.company_name}
                        className="h-7 w-7 rounded object-contain border border-border bg-muted"
                      />
                    ) : (
                      <div
                        className="h-7 w-7 rounded flex-shrink-0"
                        style={{ background: `hsl(${u.primary_color})` }}
                      />
                    )}
                    <div>
                      <span className="font-medium text-foreground">
                        {u.company_name || <span className="text-muted-foreground italic">Sans nom</span>}
                      </span>
                      {u.suspended && (
                        <span className="ml-2 text-[10px] text-red-400 font-medium">SUSPENDU</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <Shield size={11} /> Client
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-center">
                  {u.prospect_count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <PlanBadge status={u.subscription_status ?? 'free'} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {u.last_sign_in_at
                    ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true, locale: fr })
                    : <span className="italic">Jamais</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {format(new Date(u.created_at), 'd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-4 py-3">
                  {!u.is_admin && (
                    <button
                      onClick={() => handleToggleSuspend(u.id, u.suspended)}
                      disabled={loadingId === u.id}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                        u.suspended
                          ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/20'
                          : 'border-red-800 text-red-400 hover:bg-red-900/20'
                      )}
                    >
                      <ShieldOff size={11} />
                      {loadingId === u.id ? '…' : u.suspended ? 'Réactiver' : 'Suspendre'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!users?.length && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Aucun compte enregistré.
          </div>
        )}
      </div>
    </div>
  )
}
