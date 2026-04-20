import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Mail } from 'lucide-react'
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
import { useToast } from '@/components/common/Toast'
import { useTheme } from '@/context/ThemeContext'
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
    navigate('/prospects')
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/prospects')}
            className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{prospect.company_name}</h1>
              <PriorityBadge priority={prospect.priority} />
              <StageBadge stage={prospect.stage} />
            </div>
            <p className="text-sm text-muted-foreground">
              {prospect.first_name} {prospect.last_name}
              {prospect.title && ` · ${prospect.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {prospect.email && (
            <button
              onClick={() => setEmailOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Mail size={12} /> Email
            </button>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={12} /> Modifier
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-700 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={12} /> Supprimer
          </button>
        </div>
      </div>

      {/* Stage selector */}
      <StageSelector prospectId={prospect.id} currentStage={prospect.stage} />

      {/* Info card */}
      <ProspectInfoCard prospect={prospect} sectionPrefs={sectionPrefs} />

      {/* Bottom row */}
      {(sectionPrefs.show_followup || sectionPrefs.show_interactions) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {sectionPrefs.show_followup && (
            <div className="lg:col-span-1">
              <FollowUpScheduler prospectId={prospect.id} date={prospect.next_followup_date} />
            </div>
          )}
          {sectionPrefs.show_interactions && (
            <div className={sectionPrefs.show_followup ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
              <InteractionForm prospectId={prospect.id} />
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historique</p>
                <InteractionLog prospectId={prospect.id} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Modal */}
      {prospect.email && (
        <SendEmailModal
          open={emailOpen}
          onOpenChange={setEmailOpen}
          prospectId={prospect.id}
          prospectEmail={prospect.email}
          prospectFirstName={prospect.first_name}
        />
      )}

      {/* Modals */}
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
