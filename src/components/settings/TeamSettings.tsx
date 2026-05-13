import { useState } from 'react'
import { UserPlus, Trash2, Mail, Crown, Pencil, Check, X as XIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { useSubscription, PLAN_DETAILS, createCheckoutSession } from '@/hooks/useSubscription'
import {
  useTeam,
  useTeamMembers,
  useTeamInvites,
  useCurrentMember,
  useRenameTeam,
  useUpdateMember,
  useRemoveMember,
  useCancelInvite,
} from '@/hooks/useTeam'
import MemberScopeEditor from './MemberScopeEditor'
import InviteMemberModal from './InviteMemberModal'
import { cn } from '@/lib/cn'
import type { TeamMember, TeamScopes, TeamVisibilityMode } from '@/types'

const PHASE_1_MAX_MEMBERS = 3

export default function TeamSettings() {
  const { user } = useAuth()
  const { customFieldsSchema } = useTheme()
  const { data: subscription } = useSubscription()
  const { data: team } = useTeam()
  const { data: members = [] } = useTeamMembers()
  const { data: invites = [] } = useTeamInvites()
  const { data: currentMember } = useCurrentMember()
  const isOwner = currentMember?.role === 'owner'
  const renameTeam = useRenameTeam()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  // ---- Team plan gate -------------------------------------------------------

  const hasTeamPlan =
    subscription?.plan === 'team' &&
    (subscription?.status === 'active' || subscription?.status === 'past_due')

  if (!hasTeamPlan) {
    return <UpsellToTeamPlan />
  }

  if (!team || !currentMember) {
    return <p className="text-sm text-muted">Chargement…</p>
  }

  const memberCount = members.length
  const pendingCount = invites.length
  const seatsUsed = memberCount + pendingCount
  const canInvite = isOwner && seatsUsed < PHASE_1_MAX_MEMBERS

  const startRename = () => {
    setNameDraft(team.name)
    setRenaming(true)
  }

  const commitRename = async () => {
    const next = nameDraft.trim()
    if (!next || next === team.name) {
      setRenaming(false)
      return
    }
    await renameTeam.mutateAsync(next)
    setRenaming(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ----------- Header ----------- */}
      <div>
        <h2 className="text-base font-bold text-text">Équipe</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Gérez les membres de votre espace partagé et déléguez chacun à un périmètre précis.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              Nom de l'équipe
            </p>
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setRenaming(false)
                  }}
                  autoFocus
                  className="flex-1 rounded-btn border border-border bg-card px-3 py-1.5 text-sm font-semibold text-text focus:border-primary focus:outline-none"
                />
                <button onClick={commitRename} className="text-crm-green hover:opacity-80" aria-label="Valider">
                  <Check size={16} />
                </button>
                <button onClick={() => setRenaming(false)} className="text-muted hover:text-text" aria-label="Annuler">
                  <XIcon size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-text">{team.name}</p>
                {isOwner && (
                  <button onClick={startRename} className="rounded-btn p-1 text-muted hover:text-primary hover:bg-bg transition-colors" aria-label="Renommer">
                    <Pencil size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              Sièges utilisés
            </p>
            <p className="text-lg font-bold text-text">
              {seatsUsed} <span className="text-muted text-sm font-normal">/ {PHASE_1_MAX_MEMBERS}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ----------- Members ----------- */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Membres ({memberCount})
        </p>
        {isOwner && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={!canInvite}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-primary',
              !canInvite && 'opacity-50 cursor-not-allowed',
            )}
            title={!canInvite ? 'Limite Team atteinte — contactez le support pour ajouter des sièges' : undefined}
          >
            <UserPlus size={13} /> Inviter un membre
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <MemberCard
            key={m.user_id}
            member={m}
            isOwner={isOwner}
            isSelf={m.user_id === user?.id}
            customFieldsSchema={customFieldsSchema}
          />
        ))}
      </div>

      {/* ----------- Pending invites ----------- */}
      {invites.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mt-2">
            Invitations en attente ({invites.length})
          </p>
          <div className="flex flex-col gap-2">
            {invites.map((inv) => (
              <PendingInviteRow key={inv.id} email={inv.email} id={inv.id} expiresAt={inv.expires_at} />
            ))}
          </div>
        </>
      )}

      {/* ----------- Phase 1 cap notice ----------- */}
      {!canInvite && isOwner && seatsUsed >= PHASE_1_MAX_MEMBERS && (
        <div className="rounded-card border border-border bg-bg px-4 py-3">
          <p className="text-sm font-semibold text-text">Limite Team atteinte</p>
          <p className="text-[12px] text-muted mt-0.5">
            Votre plan Team inclut jusqu'à {PHASE_1_MAX_MEMBERS} membres. Pour ajouter des sièges supplémentaires
            (9 €/mois par membre), contactez <a href="mailto:support@velmiocrm.com" className="text-primary hover:underline">support@velmiocrm.com</a>.
          </p>
        </div>
      )}

      <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

// ============================================================
// Member card with inline scope editor
// ============================================================

function MemberCard({
  member,
  isOwner,
  isSelf,
  customFieldsSchema,
}: {
  member: TeamMember
  isOwner: boolean
  isSelf: boolean
  customFieldsSchema: ReturnType<typeof useTheme>['customFieldsSchema']
}) {
  const [editing, setEditing] = useState(false)
  const [visibilityMode, setVisibilityMode] = useState<TeamVisibilityMode>(member.visibility_mode)
  const [scopes, setScopes] = useState<TeamScopes>(member.scopes ?? {})
  const updateMember = useUpdateMember()
  const removeMember = useRemoveMember()

  const dirty =
    visibilityMode !== member.visibility_mode ||
    JSON.stringify(scopes) !== JSON.stringify(member.scopes ?? {})

  const save = async () => {
    await updateMember.mutateAsync({
      userId: member.user_id,
      visibility_mode: visibilityMode,
      scopes,
    })
    setEditing(false)
  }

  const cancel = () => {
    setVisibilityMode(member.visibility_mode)
    setScopes(member.scopes ?? {})
    setEditing(false)
  }

  const remove = async () => {
    if (!confirm(`Retirer ${member.email ?? 'ce membre'} de l'équipe ?`)) return
    await removeMember.mutateAsync(member.user_id)
  }

  const displayName = member.display_name?.trim() || member.email || member.user_id
  const isMemberOwner = member.role === 'owner'

  return (
    <div className="rounded-card border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary font-bold">
          {(displayName[0] ?? '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text truncate">{displayName}</p>
            {isMemberOwner && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                <Crown size={10} /> Propriétaire
              </span>
            )}
            {isSelf && (
              <span className="rounded-pill bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                vous
              </span>
            )}
          </div>
          {member.email && member.display_name?.trim() && (
            <p className="text-[12px] text-muted truncate">{member.email}</p>
          )}
          {!isMemberOwner && (
            <p className="text-[12px] text-muted mt-0.5">
              {member.visibility_mode === 'read_all' ? 'Lecture totale, édition périmètre' : 'Périmètre uniquement'}
              {Object.keys(member.scopes ?? {}).length > 0 && (
                <span> · {summarizeScopes(member.scopes)}</span>
              )}
            </p>
          )}
        </div>

        {isOwner && !isMemberOwner && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              {editing ? 'Fermer' : 'Périmètre'}
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-btn p-2 text-muted hover:text-crm-red hover:bg-crm-red-light transition-colors"
              aria-label="Retirer le membre"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {editing && isOwner && !isMemberOwner && (
        <div className="border-t border-border bg-bg/30 p-4">
          <MemberScopeEditor
            schema={customFieldsSchema}
            visibilityMode={visibilityMode}
            scopes={scopes}
            onChangeVisibilityMode={setVisibilityMode}
            onChangeScopes={setScopes}
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || updateMember.isPending}
              className="rounded-btn bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMember.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function summarizeScopes(scopes: TeamScopes): string {
  const parts = Object.entries(scopes).map(([key, vals]) =>
    `${key}: ${vals.join(', ')}`,
  )
  return parts.join(' · ')
}

// ============================================================
// Pending invite row
// ============================================================

function PendingInviteRow({ email, id, expiresAt }: { email: string; id: string; expiresAt: string }) {
  const cancel = useCancelInvite()
  const expiresIn = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
  return (
    <div className="flex items-center gap-3 rounded-card border border-dashed border-border bg-card px-4 py-2.5">
      <Mail size={14} className="text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text truncate">{email}</p>
        <p className="text-[11px] text-muted">
          {expiresIn > 0 ? `Expire dans ${expiresIn} jour${expiresIn > 1 ? 's' : ''}` : 'Expirée'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => cancel.mutate(id)}
        className="rounded-btn border border-border px-3 py-1 text-[11px] font-semibold text-muted hover:text-crm-red hover:border-crm-red transition-colors"
      >
        Annuler
      </button>
    </div>
  )
}

// ============================================================
// Upsell screen — shown when the current plan isn't Team
// ============================================================

function UpsellToTeamPlan() {
  const [pending, setPending] = useState(false)
  const team = PLAN_DETAILS.team
  const onClick = async () => {
    setPending(true)
    try {
      const url = await createCheckoutSession(window.location.href, 'team')
      window.location.href = url
    } catch (err) {
      setPending(false)
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-text">Équipe</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Invitez vos collaborateurs et partagez vos prospects.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-sm text-text">
          La gestion d'équipe est incluse dans le plan <strong>{team.label}</strong> ({team.price}).
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {team.features.map((f) => (
            <li key={f} className="text-[13px] text-muted">• {f}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="mt-4 rounded-btn bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary disabled:opacity-50"
        >
          {pending ? 'Redirection…' : `Passer au plan ${team.label}`}
        </button>
      </div>
    </div>
  )
}
