import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Linkedin } from 'lucide-react'
import { useProspect } from '@/hooks/useProspect'
import { useUpdateProspect, useDeleteProspect } from '@/hooks/useProspects'
import PriorityBadge from '@/components/common/PriorityBadge'
import StageBadge from '@/components/common/StageBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import StageSelector from '@/components/prospect-detail/StageSelector'
import ProspectInfoCard from '@/components/prospect-detail/ProspectInfoCard'
import FollowUpScheduler from '@/components/prospect-detail/FollowUpScheduler'
import InteractionLog from '@/components/prospect-detail/InteractionLog'
import InteractionForm from '@/components/prospect-detail/InteractionForm'
import SendEmailModal from '@/components/prospect-detail/SendEmailModal'
import ProspectForm from '@/components/forms/ProspectForm'
import Avatar from '@/components/common/Avatar'
import { useToast } from '@/components/common/Toast'
import { useTheme } from '@/context/ThemeContext'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { isOverdue, isDueToday } from '@/lib/dateUtils'
import type { ProspectFormData } from '@/types'

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: prospect, isLoading } = useProspect(id!)
  const update = useUpdateProspect()
  const deleteProspect = useDeleteProspect()
  const { toast } = useToast()
  const { sectionPrefs } = useTheme()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  if (isLoading) return <div className="text-muted-foreground text-sm">Chargement…</div>
  if (!prospect) return <div className="text-muted-foreground text-sm">Prospect introuvable.</div>

  const handleUpdate = async (data: ProspectFormData) => {
    await update.mutateAsync({ id: prospect.id, data })
    toast('Prospect mis à jour !')
  }

  const handleDelete = async () => {
    await deleteProspect.mutateAsync(prospect.id)
    toast('Prospect supprimé.')
    navigate('/app/prospects')
  }

  const followupOverdue = isOverdue(prospect.next_followup_date)
  const followupToday = isDueToday(prospect.next_followup_date)
  const priorityConf = PRIORITY_CONFIG[prospect.priority]

  const engagementPct = prospect.priority === 'Chaud' ? 85 : prospect.priority === 'Tiède' ? 50 : 20
  const timingPct = followupToday ? 100 : followupOverdue ? 25 : prospect.next_followup_date ? 70 : 50
  const dealPct = prospect.deal_value ? Math.min(100, Math.round((prospect.deal_value / 10000) * 100)) : 0

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={() => navigate('/app/prospects')}
            className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <Avatar firstName={prospect.first_name} lastName={prospect.last_name} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">{prospect.company_name}</h1>
              <PriorityBadge priority={prospect.priority} />
              <StageBadge stage={prospect.stage} />
            </div>
            <p className="text-sm text-muted-foreground">
              {prospect.first_name} {prospect.last_name}
              {prospect.title && ` · ${prospect.title}`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {prospect.email && (
            <button
              onClick={() => setEmailOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Mail size={12} /> Email
            </button>
          )}
          {prospect.phone && (
            <a
              href={`tel:${prospect.phone}`}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Phone size={12} /> Appeler
            </a>
          )}
          {prospect.linkedin_url && (
            <a
              href={prospect.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={12} /> Modifier
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={12} /> Supprimer
          </button>
        </div>
      </div>

      {/* Stage selector */}
      <StageSelector prospectId={prospect.id} currentStage={prospect.stage} />

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Left: info + interactions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ProspectInfoCard
            prospect={prospect}
            sectionPrefs={{ ...sectionPrefs, show_deal: false }}
          />
          {sectionPrefs.show_interactions && (
            <>
              <InteractionForm prospectId={prospect.id} />
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historique</p>
                <InteractionLog prospectId={prospect.id} />
              </div>
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-3">

          {/* Deal value */}
          {sectionPrefs.show_deal && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Valeur du deal
              </p>
              {prospect.deal_value ? (
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                  {prospect.deal_value.toLocaleString('fr-FR')}{' '}
                  <span className="text-sm font-semibold">{prospect.currency}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              )}
            </div>
          )}

          {/* Follow-up scheduler */}
          {sectionPrefs.show_followup && (
            <FollowUpScheduler prospectId={prospect.id} date={prospect.next_followup_date} />
          )}

          {/* Lead score / Priority */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Score du lead
            </p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold mb-4 ${priorityConf.classes}`}>
              {priorityConf.emoji} {priorityConf.label}
            </span>
            <div className="space-y-2.5 mt-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground w-20 flex-shrink-0">Engagement</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${engagementPct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-7 text-right">{engagementPct}%</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground w-20 flex-shrink-0">Timing</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${timingPct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-7 text-right">{timingPct}%</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground w-20 flex-shrink-0">Valeur deal</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${dealPct}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-7 text-right">{dealPct}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Email modal */}
      {prospect.email && (
        <SendEmailModal
          open={emailOpen}
          onOpenChange={setEmailOpen}
          prospectId={prospect.id}
          prospectEmail={prospect.email}
          prospectFirstName={prospect.first_name}
        />
      )}

      {/* Edit / Delete modals */}
      <ProspectForm
        open={editOpen}
        onOpenChange={setEditOpen}
        prospect={prospect}
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le prospect"
        description={`Supprimer "${prospect.company_name}" et tout son historique ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        loading={deleteProspect.isPending}
      />
    </div>
  )
}
