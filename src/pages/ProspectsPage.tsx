import { useState, useMemo } from 'react'
import { Plus, Upload, Zap } from 'lucide-react'
import { useProspects, useCreateProspect, useUpdateProspect, useDeleteProspect, useBulkCreateProspects } from '@/hooks/useProspects'
import { useSubscription, FREE_PLAN } from '@/hooks/useSubscription'
import ProspectForm from '@/components/forms/ProspectForm'
import ProspectsTable from '@/components/prospects/ProspectsTable'
import KanbanBoard from '@/components/prospects/KanbanBoard'
import ViewToggle from '@/components/prospects/ViewToggle'
import ProspectFilters, { type Filters } from '@/components/prospects/ProspectFilters'
import ExportButton from '@/components/prospects/ExportButton'
import ImportCSVModal from '@/components/prospects/ImportCSVModal'
import UpgradeModal from '@/components/common/UpgradeModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/cn'
import type { Prospect, ProspectFormData, PipelineStage } from '@/types'

function useViewMode(): ['kanban' | 'table', (v: 'kanban' | 'table') => void] {
  const saved = (localStorage.getItem('crm-view') as 'kanban' | 'table') ?? 'table'
  const [view, setView] = useState<'kanban' | 'table'>(saved)
  const set = (v: 'kanban' | 'table') => { setView(v); localStorage.setItem('crm-view', v) }
  return [view, set]
}

export default function ProspectsPage() {
  const { data: prospects = [], isLoading } = useProspects()
  const createProspect = useCreateProspect()
  const updateProspect = useUpdateProspect()
  const deleteProspect = useDeleteProspect()
  const bulkCreate = useBulkCreateProspects()
  const { data: subscription = FREE_PLAN } = useSubscription()
  const { toast } = useToast()

  const [view, setView] = useViewMode()
  const [filters, setFilters] = useState<Filters>({ search: '', stage: '', priority: '', channel: '', service: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [editProspect, setEditProspect] = useState<Prospect | null>(null)
  const [defaultStage, setDefaultStage] = useState<string>('Identifié')
  const [deleteTarget, setDeleteTarget] = useState<Prospect | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const isAtLimit = subscription.status !== 'active' && prospects.length >= subscription.prospect_limit

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !p.company_name.toLowerCase().includes(q) &&
          !p.first_name.toLowerCase().includes(q) &&
          !p.last_name.toLowerCase().includes(q) &&
          !(p.email ?? '').toLowerCase().includes(q)
        ) return false
      }
      if (filters.stage && p.stage !== filters.stage) return false
      if (filters.priority && p.priority !== filters.priority) return false
      if (filters.channel && p.channel !== filters.channel) return false
      if (filters.service && !p.services_interested.includes(filters.service)) return false
      return true
    })
  }, [prospects, filters])

  const handleOpenCreate = (stage?: PipelineStage) => {
    if (isAtLimit) { setUpgradeOpen(true); return }
    setEditProspect(null)
    setDefaultStage(stage ?? 'Identifié')
    setFormOpen(true)
  }

  const handleSubmit = async (data: ProspectFormData) => {
    if (editProspect) {
      await updateProspect.mutateAsync({ id: editProspect.id, data })
      toast('Prospect mis à jour !')
    } else {
      await createProspect.mutateAsync(data)
      toast('Prospect créé !')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteProspect.mutateAsync(deleteTarget.id)
    toast('Prospect supprimé.')
    setDeleteTarget(null)
  }

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Chargement…</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Prospects</h1>
          <p className="text-sm text-muted-foreground">{prospects.length} prospects au total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Free plan counter */}
          {subscription.status !== 'active' && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                isAtLimit
                  ? 'border-amber-700 bg-amber-900/20 text-amber-300 hover:bg-amber-900/40'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Zap size={12} />
              {prospects.length}/{subscription.prospect_limit} · Passer au Pro
            </button>
          )}
          <ExportButton prospects={filtered} />
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Upload size={14} />
            Importer
          </button>
          <ViewToggle view={view} onChange={setView} />
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Nouveau prospect
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProspectFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {view === 'table' ? (
        <ProspectsTable
          prospects={filtered}
          onEdit={(p) => { setEditProspect(p); setFormOpen(true) }}
          onDelete={(p) => setDeleteTarget(p)}
        />
      ) : (
        <KanbanBoard
          prospects={filtered}
          onAdd={handleOpenCreate}
        />
      )}

      {/* Form Modal */}
      <ProspectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        prospect={editProspect}
        defaultStage={defaultStage}
        onSubmit={handleSubmit}
      />

      {/* Upgrade Modal */}
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />

      {/* Import CSV */}
      <ImportCSVModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={async (rows) => {
          await bulkCreate.mutateAsync(rows)
          toast(`${rows.length} prospect${rows.length > 1 ? 's' : ''} importé${rows.length > 1 ? 's' : ''} !`)
        }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le prospect"
        description={`Supprimer "${deleteTarget?.company_name}" ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        loading={deleteProspect.isPending}
      />
    </div>
  )
}
