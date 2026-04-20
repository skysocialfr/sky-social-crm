import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Shield, ShieldCheck } from 'lucide-react'
import { useAdminProfiles } from '@/hooks/useUserProfile'

export default function AdminPage() {
  const { data: users, isLoading, error } = useAdminProfiles()

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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Société</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Couleur</th>
              <th className="px-4 py-3 text-left font-medium">Rôle</th>
              <th className="px-4 py-3 text-left font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
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
                    <span className="font-medium text-foreground">
                      {u.company_name || <span className="text-muted-foreground italic">Sans nom</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ background: `hsl(${u.primary_color})` }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{u.primary_color}</span>
                  </div>
                </td>
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
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {format(new Date(u.created_at), 'd MMM yyyy', { locale: fr })}
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
