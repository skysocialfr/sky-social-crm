import { useState, useMemo } from 'react'
import { Plus, Upload, Zap } from 'lucide-react'
import {
  useProspects,
  useCreateProspect,
  useUpdateProspect,
  useDeleteProspect,
  useBulkCreateProspects,
} from '@/hooks/useProspects'
import { useSubscription, FREE_PLAN } from '@/hooks/useSubscription'
import ProspectForm from '@/components/forms/ProspectForm'
import ProspectsTable from '@/components/prospects/ProspectsTable'
import KanbanBoard from '@/components/prospects/KanbanBoard'
import ViewToggle from '@/components/prospects/ViewToggle'
import ProspectFilters, { type Filters } from '@/components/prospects/ProspectFilters'
import AdvancedFilterPanel from '@/components/prospects/AdvancedFilterPanel'
import ExportButton from '@/components/prospects/ExportButton'
import ImportCSVModal from '@/components/prospects/ImportCSVModal'
import UpgradeModal from '@/components/common/UpgradeModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { evaluateConditions, type FilterCondition } from '@/lib/filterUtils'
import { cn } from '@/lib/cn'
import type { Prospect, ProspectFormData, PipelineStage } from '@/types'

function useViewMode(): ['kanban' | 'table', (v: 'kanban' | 'table') => void] {
  const saved = (localStorage.getItem('crm-view') as 'kanban' | 'table') ?? 'table'
  const [view, setView] = useState<'kanban' | 'table'>(saved)
  const set = (v: 'kanban' | 'table') => {
    setView(v)
    localStorage.setItem('crm-view', v)
  }
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
  const [filters, setFilters] = useState<Filters>({
    search: '',
    stage: '',
    priority: '',
    channel: '',
    service: '',
  })
  const [advConditions, setAdvConditions] = useState<FilterCondition[]>([])
  const [advOpen, setAdvOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editProspect, setEditProspect] = useState<Prospect | null>(null)
  const [defaultStage, setDefaultStage] = useState<string>('Identifié')
  const [deleteTarget, setDeleteTarget] = useState<Prospect | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const isAtLimit =
    subscription.status !== 'active' && prospects.length >= subscription.prospect_limit

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !p.company_name.toLowerCase().includes(q) &&
          !p.first_name.toLowerCase().includes(q) &&
          !p.last_name.toLowerCase().includes(q) &&
          !(p.email ?? '').toLowerCase().includes(q)
        )
          return false
      }
      if (filters.stage && p.stage !== filters.stage) return false
      if (filters.priority && p.priority !== filters.priority) return false
      if (filters.channel && p.channel !== filters.channel) return false
      if (filters.service && !p.services_interested.includes(filters.service)) return false
      if (advConditions.length > 0 && !evaluateConditions(p, advConditions)) return false
      return true
    })
  }, [prospects, filters, advConditions])

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
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-16 rounded-card bg-border" />
        <div className="h-10 rounded-btn bg-border w-2/3" />
        <div className="h-64 rounded-card bg-border" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-text">Prospects</h1>
          <p className="text-[13px] text-muted mt-0.5">
            {filtered.length !== prospects.length
              ? `${filtered.length} sur ${prospects.length} prospects`
              : `${prospects.length} prospect${prospects.length !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {subscription.status !== 'active' && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-btn border px-3 py-2 text-xs font-semibold transition-colors',
                isAtLimit
                  ? 'border-crm-amber bg-crm-amber-light text-crm-amber'
                  : 'border-border text-muted hover:text-text hover:bg-bg'
              )}
            >
              <Zap size={12} />
              {prospects.length}/{subscription.prospect_limit} · Passer au Pro
            </button>
          )}
          <ExportButton prospects={filtered} />
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 rounded-btn border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
          >
            <Upload size={13} />
            Importer
          </button>
          <ViewToggle view={view} onChange={setView} />
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-1.5 rounded-btn px-4 py-2 text-xs font-bold text-white hover:shadow-primary transition-shadow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f52d4)' }}
          >
            <Plus size={14} />
            Nouveau prospect
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProspectFilters
        filters={filters}
        onChange={setFilters}
        advancedCount={advConditions.length}
        onAdvancedToggle={() => setAdvOpen(true)}
      />

      {/* Content */}
      {view === 'table' ? (
        <ProspectsTable
          prospects={filtered}
          onEdit={(p) => { setEditProspect(p); setFormOpen(true) }}
          onDelete={(p) => setDeleteTarget(p)}
        />
      ) : (
        <KanbanBoard prospects={filtered} onAdd={handleOpenCreate} />
      )}

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        open={advOpen}
        onClose={() => setAdvOpen(false)}
        conditions={advConditions}
        onChange={setAdvConditions}
      />

      {/* Modals */}
      <ProspectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        prospect={editProspect}
        defaultStage={defaultStage}
        onSubmit={handleSubmit}
      />
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <ImportCSVModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={async (rows) => {
          await bulkCreate.mutateAsync(rows)
          toast(
            `${rows.length} prospect${rows.length > 1 ? 's' : ''} importé${rows.length > 1 ? 's' : ''} !`
          )
        }}
      />
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
