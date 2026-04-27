import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Linkedin, ExternalLink } from 'lucide-react'
import { useProspect } from '@/hooks/useProspect'
import { useUpdateProspect, useDeleteProspect } from '@/hooks/useProspects'
import StageBadge from '@/components/common/StageBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import StageSelector from '@/components/prospect-detail/StageSelector'
import ProspectInfoCard from '@/components/prospect-detail/ProspectInfoCard'
import FollowUpScheduler from '@/components/prospect-detail/FollowUpScheduler'
import InteractionLog from '@/components/prospect-detail/InteractionLog'
import InteractionForm from '@/components/prospect-detail/InteractionForm'
import SendEmailModal from '@/components/prospect-detail/SendEmailModal'
import ProspectForm from '@/components/forms/ProspectForm'
import { dicebearAvatar } from '@/lib/avatar'
import { useToast } from '@/components/common/Toast'
import { useTheme } from '@/context/ThemeContext'
import { PRIORITY_CONFIG } from '@/lib/constants'
import { isOverdue, isDueToday } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl animate-pulse">
        <div className="h-36 rounded-card bg-border" />
        <div className="h-14 rounded-card bg-border" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 rounded-card bg-border" />
          <div className="lg:col-span-2 h-64 rounded-card bg-border" />
        </div>
      </div>
    )
  }
  if (!prospect) {
    return <p className="text-muted text-sm">Prospect introuvable.</p>
  }

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
      <div className="rounded-card shadow-card border border-border bg-card p-5">
        {/* Back + avatar row */}
        <div className="flex items-start gap-4 mb-5">
          <button
            onClick={() => navigate('/app/prospects')}
            className="mt-1 rounded-btn p-1.5 text-muted hover:text-text hover:bg-bg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <img
            src={dicebearAvatar(`${prospect.first_name} ${prospect.last_name}`)}
            alt=""
            width={80}
            height={80}
            className="rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-text">{prospect.company_name}</h1>
              <span className={cn('inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-bold', priorityConf.classes)}>
                {priorityConf.emoji} {priorityConf.label}
              </span>
              <StageBadge stage={prospect.stage} />
            </div>
            <p className="text-sm text-muted">
              {prospect.first_name} {prospect.last_name}
              {prospect.title && ` · ${prospect.title}`}
            </p>
            {prospect.deal_value != null && (
              <p className="text-lg font-black text-crm-green mt-1">
                {prospect.deal_value.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold">{prospect.currency}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {prospect.email && (
            <button
              onClick={() => setEmailOpen(true)}
              className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              <Mail size={12} /> Email
            </button>
          )}
          {prospect.phone && (
            <a
              href={`tel:${prospect.phone}`}
              className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              <Phone size={12} /> Appeler
            </a>
          )}
          {prospect.linkedin_url && (
            <a
              href={prospect.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              <ExternalLink size={12} /> Site web
            </a>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
          >
            <Pencil size={12} /> Modifier
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-btn border border-crm-red bg-crm-red-light px-3 py-1.5 text-xs font-semibold text-crm-red hover:opacity-80 transition-opacity"
          >
            <Trash2 size={12} /> Supprimer
          </button>
        </div>
      </div>

      {/* Stage selector */}
      <StageSelector prospectId={prospect.id} currentStage={prospect.stage} />

      {/* Main 2-column layout: info left, timeline right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Left sidebar: info + deal + followup + score */}
        <div className="flex flex-col gap-3">
          <ProspectInfoCard
            prospect={prospect}
            sectionPrefs={{ ...sectionPrefs, show_deal: false, show_interactions: false }}
          />

          {sectionPrefs.show_deal && prospect.deal_value != null && (
            <div className="rounded-card shadow-card border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                Valeur du deal
              </p>
              <p className="text-2xl font-black text-crm-green leading-tight">
                {prospect.deal_value.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold">{prospect.currency}</span>
              </p>
            </div>
          )}

          {sectionPrefs.show_followup && (
            <FollowUpScheduler prospectId={prospect.id} date={prospect.next_followup_date} />
          )}

          {/* Lead score */}
          <div className="rounded-card shadow-card border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
              Score du lead
            </p>
            <span className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-bold mb-4', priorityConf.classes)}>
              {priorityConf.emoji} {priorityConf.label}
            </span>
            <div className="space-y-2.5">
              {[
                { label: 'Engagement', pct: engagementPct, color: '#6366f1' },
                { label: 'Timing', pct: timingPct, color: '#d97706' },
                { label: 'Valeur deal', pct: dealPct, color: '#16a34a' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted w-20 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-muted w-7 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: interaction timeline */}
        {sectionPrefs.show_interactions && (
          <div className="lg:col-span-2 flex flex-col gap-4">
            <InteractionForm prospectId={prospect.id} />
            <div className="rounded-card shadow-card border border-border bg-card p-4">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Historique
              </p>
              <InteractionLog prospectId={prospect.id} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {prospect.email && (
        <SendEmailModal
          open={emailOpen}
          onOpenChange={setEmailOpen}
          prospectId={prospect.id}
          prospectEmail={prospect.email}
          prospectFirstName={prospect.first_name}
        />
      )}
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
