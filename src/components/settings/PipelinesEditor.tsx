import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical, Star, Pencil, Check, X } from 'lucide-react'
import {
  usePipelines,
  useCreatePipeline,
  useUpdatePipeline,
  useDeletePipelineWithReassign,
  useSetDefaultPipeline,
} from '@/hooks/usePipelines'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/components/common/Toast'
import { STAGE_COLOR_PRESETS, DEFAULT_STAGES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { Pipeline, PipelineStageDef } from '@/types'

// Owner-only screen to create/rename/delete pipelines and edit
// each pipeline's ordered stages list (label + colour).
//
// Inline-edit pattern: the user expands one pipeline at a time
// and stages can be added/removed/reordered locally before
// pressing Sauvegarder, which fires a single update mutation.
export default function PipelinesEditor() {
  const { isTeamOwner } = useTheme()
  const { data: pipelines = [], isLoading } = usePipelines()
  const createPipeline = useCreatePipeline()
  const deletePipeline = useDeletePipelineWithReassign()
  const setDefault = useSetDefaultPipeline()
  const { toast } = useToast()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Pipeline | null>(null)

  if (!isTeamOwner) {
    return (
      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-sm text-muted">
          Seul le propriétaire de l'équipe peut gérer les leads.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Chargement…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-text">Leads</p>
          <p className="text-[11px] text-muted mt-0.5">
            Crée plusieurs leads pour gérer différents canaux d'acquisition (ex: Acquisition B2C, Acquisition B2B, Recrutement).
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 rounded-btn bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-primary"
        >
          <Plus size={13} />
          Nouveau lead
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {pipelines.map(p => (
          <PipelineCard
            key={p.id}
            pipeline={p}
            canDelete={pipelines.length > 1}
            expanded={expandedId === p.id}
            onToggle={() => setExpandedId(prev => (prev === p.id ? null : p.id))}
            onSetDefault={async () => {
              await setDefault.mutateAsync(p.id)
              toast(`"${p.name}" est désormais le lead par défaut.`)
            }}
            onDelete={() => setDeleteTarget(p)}
          />
        ))}
      </div>

      <NewPipelineModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        onCreate={async (name, stages) => {
          await createPipeline.mutateAsync({ name, stages })
          toast(`Lead "${name}" créé.`)
        }}
      />

      <DeletePipelineModal
        pipeline={deleteTarget}
        others={pipelines.filter(p => p.id !== deleteTarget?.id)}
        loading={deletePipeline.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async (moveToId) => {
          if (!deleteTarget) return
          const dest = pipelines.find(p => p.id === moveToId)
          const firstStage = dest?.stages?.[0]?.label ?? DEFAULT_STAGES[0].label
          try {
            await deletePipeline.mutateAsync({
              id: deleteTarget.id,
              moveToId,
              moveToFirstStage: firstStage,
              wasDefault: deleteTarget.is_default,
            })
            toast(`Lead supprimé. Les prospects ont été déplacés vers "${dest?.name}".`)
            setDeleteTarget(null)
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression.'
            toast(msg, 'error')
          }
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------
// Delete confirmation — prospects must be moved to another pipeline
// first (pipeline_id is NOT NULL / ON DELETE RESTRICT in the DB).
// ---------------------------------------------------------------

function DeletePipelineModal({
  pipeline,
  others,
  loading,
  onClose,
  onConfirm,
}: {
  pipeline: Pipeline | null
  others: Pipeline[]
  loading: boolean
  onClose: () => void
  onConfirm: (moveToId: string) => void
}) {
  const [moveToId, setMoveToId] = useState('')

  useEffect(() => {
    if (pipeline && others.length) {
      setMoveToId((others.find(p => p.is_default) ?? others[0]).id)
    }
  }, [pipeline, others])

  if (!pipeline) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-modal">
        <p className="text-base font-bold text-text mb-1">Supprimer « {pipeline.name} »</p>
        <p className="text-[12px] text-muted mb-4">
          Cette action est irréversible. Les prospects de ce lead seront déplacés vers un autre lead
          (et replacés sur sa première étape).
          {pipeline.is_default && ' Comme c’est le lead par défaut, la destination deviendra le nouveau lead par défaut.'}
        </p>

        <label className="text-xs font-semibold text-text">Déplacer les prospects vers</label>
        <select
          value={moveToId}
          onChange={(e) => setMoveToId(e.target.value)}
          className="mt-1 w-full rounded-btn border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          {others.map(p => (
            <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (défaut)' : ''}</option>
          ))}
        </select>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-bg"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(moveToId)}
            disabled={!moveToId || loading}
            className="rounded-btn bg-crm-red px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Suppression…' : 'Déplacer et supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------
// Pipeline card with inline editor
// ---------------------------------------------------------------

function PipelineCard({
  pipeline,
  canDelete,
  expanded,
  onToggle,
  onSetDefault,
  onDelete,
}: {
  pipeline: Pipeline
  canDelete: boolean
  expanded: boolean
  onToggle: () => void
  onSetDefault: () => void
  onDelete: () => void
}) {
  const update = useUpdatePipeline()
  const { toast } = useToast()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(pipeline.name)
  const [stages, setStages] = useState<PipelineStageDef[]>(pipeline.stages)

  useEffect(() => {
    setNameDraft(pipeline.name)
    setStages(pipeline.stages)
  }, [pipeline.id, pipeline.name, pipeline.stages])

  const saveName = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === pipeline.name) {
      setNameDraft(pipeline.name)
      setEditingName(false)
      return
    }
    await update.mutateAsync({ id: pipeline.id, name: trimmed })
    setEditingName(false)
    toast('Lead renommé.')
  }

  const saveStages = async () => {
    const cleaned = stages
      .map(s => ({ ...s, label: s.label.trim() }))
      .filter(s => s.label.length > 0)
    if (cleaned.length === 0) {
      toast('Au moins une étape est requise.', 'error')
      return
    }
    // No duplicate labels.
    const labels = cleaned.map(s => s.label.toLowerCase())
    if (new Set(labels).size !== labels.length) {
      toast('Les noms d\'étapes doivent être uniques.', 'error')
      return
    }
    await update.mutateAsync({ id: pipeline.id, stages: cleaned })
    toast('Étapes mises à jour.')
  }

  return (
    <div className="rounded-card border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') { setNameDraft(pipeline.name); setEditingName(false) }
                }}
                autoFocus
                className="flex-1 rounded-btn border border-primary bg-card px-2 py-1 text-sm font-bold text-text focus:outline-none"
              />
              <button onClick={saveName} className="rounded-btn p-1.5 text-crm-green hover:bg-bg">
                <Check size={14} />
              </button>
              <button onClick={() => { setNameDraft(pipeline.name); setEditingName(false) }} className="rounded-btn p-1.5 text-muted hover:bg-bg">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-text truncate">{pipeline.name}</p>
              {pipeline.is_default && (
                <span className="flex items-center gap-0.5 rounded-pill bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold">
                  <Star size={9} fill="currentColor" /> Défaut
                </span>
              )}
              <span className="text-[11px] text-muted ml-auto mr-2">
                {pipeline.stages.length} étape{pipeline.stages.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        {!editingName && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditingName(true)}
              className="rounded-btn p-1.5 text-muted hover:text-text hover:bg-bg transition-colors"
              title="Renommer"
            >
              <Pencil size={13} />
            </button>
            {!pipeline.is_default && (
              <button
                onClick={onSetDefault}
                className="rounded-btn p-1.5 text-muted hover:text-amber-600 hover:bg-bg transition-colors"
                title="Définir comme lead par défaut"
              >
                <Star size={13} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-btn p-1.5 text-muted hover:text-crm-red hover:bg-bg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onToggle}
              className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              {expanded ? 'Replier' : 'Éditer les étapes'}
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border bg-bg p-4 flex flex-col gap-3">
          <StagesEditor stages={stages} onChange={setStages} />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setStages(pipeline.stages)}
              className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-card transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={saveStages}
              disabled={update.isPending}
              className="rounded-btn bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {update.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// Stages list editor (label + colour + reorder + add/remove)
// ---------------------------------------------------------------

function StagesEditor({
  stages,
  onChange,
}: {
  stages: PipelineStageDef[]
  onChange: (s: PipelineStageDef[]) => void
}) {
  const updateStage = (i: number, patch: Partial<PipelineStageDef>) => {
    const next = [...stages]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  const removeStage = (i: number) => {
    onChange(stages.filter((_, idx) => idx !== i))
  }

  const moveStage = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= stages.length) return
    const next = [...stages]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const addStage = () => {
    const usedColors = new Set(stages.map(s => s.color))
    const nextColor = STAGE_COLOR_PRESETS.find(c => !usedColors.has(c)) ?? STAGE_COLOR_PRESETS[0]
    onChange([...stages, { label: 'Nouvelle étape', color: nextColor }])
  }

  return (
    <div className="flex flex-col gap-2">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-2 rounded-btn border border-border bg-card p-2">
          <div className="flex flex-col">
            <button
              onClick={() => moveStage(i, -1)}
              disabled={i === 0}
              className="text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <GripVertical size={11} className="rotate-90" />
            </button>
          </div>

          <ColorPicker
            color={s.color}
            onChange={(c) => updateStage(i, { color: c })}
          />

          <input
            value={s.label}
            onChange={(e) => updateStage(i, { label: e.target.value })}
            className="flex-1 rounded-btn border border-border bg-bg px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
            placeholder="Nom de l'étape"
          />

          <button
            onClick={() => moveStage(i, 1)}
            disabled={i === stages.length - 1}
            className="rounded-btn p-1 text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            title="Descendre"
          >
            ↓
          </button>
          <button
            onClick={() => moveStage(i, -1)}
            disabled={i === 0}
            className="rounded-btn p-1 text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            title="Monter"
          >
            ↑
          </button>
          <button
            onClick={() => removeStage(i)}
            disabled={stages.length === 1}
            className="rounded-btn p-1 text-muted hover:text-crm-red disabled:opacity-30 disabled:cursor-not-allowed"
            title="Supprimer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={addStage}
        className="flex items-center justify-center gap-1.5 rounded-btn border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-card transition-colors"
      >
        <Plus size={12} />
        Ajouter une étape
      </button>
    </div>
  )
}

function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const [customHex, setCustomHex] = useState(color)

  // Keep the input in sync with the current colour when reopening.
  useEffect(() => { setCustomHex(color) }, [color, open])

  const tryApplyCustom = (raw: string) => {
    const normalized = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      onChange(normalized.toLowerCase())
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="h-6 w-6 rounded-full border-2 border-card shadow-sm"
        style={{ backgroundColor: color }}
        title="Choisir une couleur"
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Explicit width — without it, grid-cols-4 with fr columns
              collapses to 0-width when the parent (a 24px picker
              button) doesn't constrain the popup, causing all 4
              circles per row to overlap at x=0. */}
          <div className="absolute top-full left-0 mt-1 z-20 w-[180px] rounded-card border border-border bg-card p-2 shadow-modal">
            <div className="grid grid-cols-4 gap-1.5">
              {STAGE_COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false) }}
                  className={cn(
                    'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                    c === color ? 'border-text' : 'border-card'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Choisir la couleur ${c}`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
              <span
                className="h-5 w-5 flex-shrink-0 rounded-full border border-border"
                style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(customHex) ? customHex : color }}
              />
              <input
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value)
                  tryApplyCustom(e.target.value)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') setOpen(false) }}
                placeholder="#64748b"
                maxLength={7}
                className="flex-1 min-w-0 rounded-btn border border-border bg-bg px-2 py-1 text-[11px] font-mono text-text focus:border-primary focus:outline-none"
                aria-label="Code hexadécimal"
              />
            </div>
            <p className="mt-1 text-[10px] text-muted">
              Tape un hex (ex: #64748b) pour une couleur libre.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------
// "New pipeline" modal — minimal form with name + a fresh blank
// stage. The user immediately fills in stages after creation
// (rather than us doing a multi-step wizard).
// ---------------------------------------------------------------

function NewPipelineModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreate: (name: string, stages: PipelineStageDef[]) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [preset, setPreset] = useState<'commercial' | 'blank'>('commercial')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setPreset('commercial')
      setSaving(false)
    }
  }, [open])

  if (!open) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const stages = preset === 'commercial'
        ? DEFAULT_STAGES
        : [{ label: 'Nouvelle étape', color: STAGE_COLOR_PRESETS[0] }]
      await onCreate(name.trim(), stages)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-modal">
        <p className="text-base font-bold text-text mb-1">Nouveau lead</p>
        <p className="text-[11px] text-muted mb-4">
          Donne-lui un nom (ex: "Acquisition B2C", "Acquisition B2B", "Recrutement") et choisis un modèle de départ.
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-text">Nom</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              placeholder="Acquisition B2C"
              className="mt-1 w-full rounded-btn border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text">Modèle de départ</label>
            <div className="mt-1 flex flex-col gap-1">
              <PresetOption
                value="commercial"
                current={preset}
                onChange={setPreset}
                label="Modèle commercial classique"
                description="8 étapes : Identifié → Premier contact → … → Gagné / Perdu"
              />
              <PresetOption
                value="blank"
                current={preset}
                onChange={setPreset}
                label="Vide (1 étape)"
                description="Configure tes propres étapes après la création"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-bg"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="rounded-btn bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Création…' : 'Créer le lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PresetOption({
  value,
  current,
  onChange,
  label,
  description,
}: {
  value: 'commercial' | 'blank'
  current: 'commercial' | 'blank'
  onChange: (v: 'commercial' | 'blank') => void
  label: string
  description: string
}) {
  const active = current === value
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-btn border px-3 py-2 text-left transition-colors',
        active ? 'border-primary bg-primary-light' : 'border-border hover:bg-bg'
      )}
    >
      <span className={cn('text-xs font-semibold', active ? 'text-primary' : 'text-text')}>{label}</span>
      <span className="text-[11px] text-muted">{description}</span>
    </button>
  )
}
