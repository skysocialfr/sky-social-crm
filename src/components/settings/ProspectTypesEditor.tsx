import { useEffect, useState } from 'react'
import {
  ChevronDown, ChevronUp, Plus, Trash2, Sparkles, GripVertical, Wand2,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useBulkCreateProspects } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import Toggle from '@/components/common/Toggle'
import { cn } from '@/lib/cn'
import { slugify } from '@/lib/slugify'
import {
  EXAMPLE_PROSPECT_TYPES,
  TYPE_COLOR_PRESETS,
  TYPE_EMOJI_PRESETS,
  buildDemoProspects,
} from '@/lib/prospectTypes'
import type {
  CustomField,
  CustomFieldType,
  CustomFieldsSchema,
  ProspectType,
} from '@/types'

const TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: 'text',        label: 'Texte court' },
  { value: 'textarea',    label: 'Texte long' },
  { value: 'number',      label: 'Nombre' },
  { value: 'boolean',     label: 'Oui / Non' },
  { value: 'date',        label: 'Date' },
  { value: 'select',      label: 'Liste déroulante' },
  { value: 'multiselect', label: 'Choix multiple' },
  { value: 'url',         label: 'URL / Lien' },
]

const TYPES_WITH_OPTIONS: CustomFieldType[] = ['select', 'multiselect']

const inputClass =
  'w-full rounded-btn border border-border bg-card px-3 py-2 text-sm text-text focus:border-primary focus:outline-none'

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function collectKeys(type: ProspectType, excludeId?: string): Set<string> {
  const set = new Set<string>()
  for (const f of type.fields) if (f.id !== excludeId) set.add(f.key)
  return set
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function ProspectTypesEditor() {
  const { customFieldsSchema, updateCustomFieldsSchema, isTeamOwner } = useTheme()
  const bulkCreate = useBulkCreateProspects()
  const { toast } = useToast()

  const [types, setTypes] = useState<ProspectType[]>(customFieldsSchema.prospect_types)
  const [openId, setOpenId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    setTypes(customFieldsSchema.prospect_types)
  }, [customFieldsSchema.prospect_types])

  const dirty = JSON.stringify(types) !== JSON.stringify(customFieldsSchema.prospect_types)

  const withSchema = (nextTypes: ProspectType[]): CustomFieldsSchema => ({
    ...customFieldsSchema,
    prospect_types: nextTypes.map((t, i) => ({ ...t, position: i })),
  })

  // --- type ops -------------------------------------------------------------

  const addType = () => {
    const id = uid()
    setTypes((prev) => [
      ...prev,
      {
        id,
        label: 'Nouveau type',
        emoji: TYPE_EMOJI_PRESETS[prev.length % TYPE_EMOJI_PRESETS.length],
        color: TYPE_COLOR_PRESETS[prev.length % TYPE_COLOR_PRESETS.length],
        description: '',
        fields: [],
        position: prev.length,
      },
    ])
    setOpenId(id)
  }

  const loadExamples = () => {
    setTypes(EXAMPLE_PROSPECT_TYPES.map((t) => ({ ...t, fields: t.fields.map((f) => ({ ...f })) })))
    setOpenId(null)
  }

  const updateType = (id: string, patch: Partial<ProspectType>) => {
    setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeType = (id: string) => {
    setTypes((prev) => prev.filter((t) => t.id !== id))
  }

  const moveType = (idx: number, dir: -1 | 1) => {
    setTypes((prev) => moveItem(prev, idx, idx + dir))
  }

  // --- field ops ------------------------------------------------------------

  const addField = (typeId: string) => {
    setTypes((prev) =>
      prev.map((t) => {
        if (t.id !== typeId) return t
        const label = 'Nouveau champ'
        return { ...t, fields: [...t.fields, { id: uid(), key: slugify(label, collectKeys(t)), label, type: 'text' }] }
      }),
    )
  }

  const updateField = (typeId: string, fieldId: string, patch: Partial<CustomField>) => {
    setTypes((prev) =>
      prev.map((t) => {
        if (t.id !== typeId) return t
        return {
          ...t,
          fields: t.fields.map((f) => {
            if (f.id !== fieldId) return f
            const next = { ...f, ...patch }
            if (patch.label !== undefined && patch.key === undefined) {
              next.key = slugify(patch.label, collectKeys(t, fieldId))
            }
            if (patch.type !== undefined && !TYPES_WITH_OPTIONS.includes(patch.type)) delete next.options
            if (patch.type !== undefined && TYPES_WITH_OPTIONS.includes(patch.type) && !next.options) next.options = []
            return next
          }),
        }
      }),
    )
  }

  const removeField = (typeId: string, fieldId: string) => {
    setTypes((prev) =>
      prev.map((t) => (t.id !== typeId ? t : { ...t, fields: t.fields.filter((f) => f.id !== fieldId) })),
    )
  }

  const moveField = (typeId: string, fieldId: string, dir: -1 | 1) => {
    setTypes((prev) =>
      prev.map((t) => {
        if (t.id !== typeId) return t
        const idx = t.fields.findIndex((f) => f.id === fieldId)
        if (idx < 0) return t
        return { ...t, fields: moveItem(t.fields, idx, idx + dir) }
      }),
    )
  }

  // --- persistence ----------------------------------------------------------

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateCustomFieldsSchema(withSchema(types))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleSeedDemo = async () => {
    setSeeding(true)
    setError('')
    try {
      // Ensure the example types exist so the demo prospects resolve to
      // a real type. Only seed types if the tenant has none yet.
      const baseTypes = types.length ? types : EXAMPLE_PROSPECT_TYPES
      await updateCustomFieldsSchema(withSchema(baseTypes))
      setTypes(baseTypes.map((t, i) => ({ ...t, position: i })))
      await bulkCreate.mutateAsync(buildDemoProspects())
      toast('5 prospects de démonstration créés !')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération des données de démo.')
    } finally {
      setSeeding(false)
    }
  }

  // --- render ---------------------------------------------------------------

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-text">Types de prospect</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Définissez les profils que vous prospectez. À la création d'un prospect, vous choisirez d'abord son
          type, puis ne remplirez que les champs utiles à ce type.
        </p>
        {!isTeamOwner && (
          <p className="mt-2 rounded-btn border border-border bg-bg px-3 py-2 text-[12px] text-muted">
            Seul le propriétaire de l'équipe peut modifier les types. Vous pouvez les consulter ci-dessous.
          </p>
        )}
      </div>

      {/* Empty state */}
      {types.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-card px-5 py-10 text-center flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary-light p-3">
            <Sparkles size={22} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-text">Aucun type de prospect pour l'instant</p>
          <p className="text-[13px] text-muted max-w-sm">
            Commencez avec des exemples prêts à l'emploi (Photographe, Vidéaste, Agence de com, Entreprise,
            Investisseur), puis adaptez-les à votre activité.
          </p>
          {isTeamOwner && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={loadExamples}
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-primary"
              >
                <Wand2 size={13} /> Charger les types d'exemple
              </button>
              <button
                type="button"
                onClick={addType}
                className="inline-flex items-center gap-1.5 rounded-btn border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-bg transition-colors"
              >
                <Plus size={13} /> Créer un type vide
              </button>
            </div>
          )}
        </div>
      )}

      {/* Type cards */}
      {types.length > 0 && (
        <div className="flex flex-col gap-3">
          {types.map((type, idx) => {
            const isOpen = openId === type.id
            return (
              <div key={type.id} className="rounded-card border border-border bg-card overflow-hidden">
                {/* Card header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="w-1.5 self-stretch rounded-full"
                    style={{ background: type.color || '#6366f1' }}
                    aria-hidden
                  />
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-btn text-lg"
                    style={{ background: `${type.color || '#6366f1'}1a` }}>
                    {type.emoji || '👤'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : type.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-bold text-text truncate">{type.label || 'Sans nom'}</p>
                    <p className="text-[12px] text-muted truncate">
                      {type.fields.length} champ{type.fields.length !== 1 ? 's' : ''}
                      {type.description ? ` · ${type.description}` : ''}
                    </p>
                  </button>
                  {isTeamOwner && (
                    <>
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveType(idx, -1)} disabled={idx === 0}
                          className="text-muted hover:text-text disabled:opacity-30" aria-label="Monter">
                          <ChevronUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveType(idx, 1)} disabled={idx === types.length - 1}
                          className="text-muted hover:text-text disabled:opacity-30" aria-label="Descendre">
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeType(type.id)}
                        className="rounded-btn p-1.5 text-muted hover:text-crm-red hover:bg-crm-red-light transition-colors"
                        aria-label="Supprimer le type">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : type.id)}
                    className="rounded-btn p-1.5 text-muted hover:text-text hover:bg-bg transition-colors"
                    aria-label={isOpen ? 'Réduire' : 'Configurer'}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded editor */}
                {isOpen && (
                  <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
                    {/* Identity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Nom du type</label>
                        <input
                          value={type.label}
                          onChange={(e) => updateType(type.id, { label: e.target.value })}
                          disabled={!isTeamOwner}
                          className={inputClass}
                          placeholder="Ex : Photographe"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Description</label>
                        <input
                          value={type.description ?? ''}
                          onChange={(e) => updateType(type.id, { description: e.target.value })}
                          disabled={!isTeamOwner}
                          className={inputClass}
                          placeholder="Courte description (optionnel)"
                        />
                      </div>
                    </div>

                    {/* Emoji + color */}
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Icône</label>
                        <div className="flex flex-wrap gap-1">
                          {TYPE_EMOJI_PRESETS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => updateType(type.id, { emoji: e })}
                              disabled={!isTeamOwner}
                              className={cn(
                                'grid h-8 w-8 place-items-center rounded-btn border text-base transition-colors',
                                type.emoji === e ? 'border-primary bg-primary-light' : 'border-border hover:bg-bg',
                              )}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">Couleur</label>
                        <div className="flex flex-wrap gap-1.5">
                          {TYPE_COLOR_PRESETS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateType(type.id, { color: c })}
                              disabled={!isTeamOwner}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition-transform',
                                type.color === c ? 'border-text scale-110' : 'border-transparent',
                              )}
                              style={{ background: c }}
                              aria-label={`Couleur ${c}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="rounded-card border border-border">
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                          Champs demandés pour ce type
                        </p>
                      </div>
                      {type.fields.length === 0 ? (
                        <p className="px-4 py-4 text-center text-[13px] text-muted">
                          Aucun champ. Ajoutez les informations à renseigner pour un {type.label || 'prospect'}.
                        </p>
                      ) : (
                        <div className="divide-y divide-border">
                          {type.fields.map((field, fieldIdx) => (
                            <FieldRow
                              key={field.id}
                              field={field}
                              readOnly={!isTeamOwner}
                              isFirst={fieldIdx === 0}
                              isLast={fieldIdx === type.fields.length - 1}
                              onUpdate={(patch) => updateField(type.id, field.id, patch)}
                              onRemove={() => removeField(type.id, field.id)}
                              onMove={(dir) => moveField(type.id, field.id, dir)}
                            />
                          ))}
                        </div>
                      )}
                      {isTeamOwner && (
                        <div className="border-t border-border px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => addField(type.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            <Plus size={12} /> Ajouter un champ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {isTeamOwner && (
            <button
              type="button"
              onClick={addType}
              className="inline-flex items-center justify-center gap-1.5 rounded-card border border-dashed border-border bg-card px-4 py-3 text-xs font-semibold text-primary hover:border-primary hover:bg-primary-light transition-colors"
            >
              <Plus size={14} /> Ajouter un type de prospect
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">{error}</p>
      )}
      {success && (
        <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
          Types sauvegardés.
        </p>
      )}

      {isTeamOwner && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              'rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary',
              (!dirty || saving) && 'opacity-50 cursor-not-allowed',
            )}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
          {dirty && !saving && (
            <button
              type="button"
              onClick={() => setTypes(customFieldsSchema.prospect_types)}
              className="rounded-btn border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              Annuler les modifications
            </button>
          )}
          <button
            type="button"
            onClick={handleSeedDemo}
            disabled={seeding || bulkCreate.isPending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-btn border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-bg transition-colors disabled:opacity-50"
            title="Crée 5 prospects fictifs (un par type d'exemple) pour tester."
          >
            <Sparkles size={13} /> {seeding ? 'Génération…' : 'Générer 5 prospects de démo'}
          </button>
        </div>
      )}
    </div>
  )
}

// --- field row --------------------------------------------------------------

function FieldRow({
  field, readOnly, isFirst, isLast, onUpdate, onRemove, onMove,
}: {
  field: CustomField
  readOnly: boolean
  isFirst: boolean
  isLast: boolean
  onUpdate: (patch: Partial<CustomField>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const needsOptions = TYPES_WITH_OPTIONS.includes(field.type)
  return (
    <div className="px-3 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {!readOnly && (
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => onMove(-1)} disabled={isFirst}
              className="text-muted hover:text-text disabled:opacity-30" aria-label="Monter le champ">
              <ChevronUp size={12} />
            </button>
            <button type="button" onClick={() => onMove(1)} disabled={isLast}
              className="text-muted hover:text-text disabled:opacity-30" aria-label="Descendre le champ">
              <ChevronDown size={12} />
            </button>
          </div>
        )}
        {readOnly && <GripVertical size={14} className="text-muted flex-shrink-0" />}
        <input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          disabled={readOnly}
          placeholder="Libellé du champ"
          className={cn(inputClass, 'flex-1')}
        />
        <select
          value={field.type}
          onChange={(e) => onUpdate({ type: e.target.value as CustomFieldType })}
          disabled={readOnly}
          className={cn(inputClass, 'w-40')}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 px-1">
          <Toggle checked={!!field.required} onChange={() => onUpdate({ required: !field.required })} disabled={readOnly} />
          <span className="text-[11px] text-muted">Requis</span>
        </div>
        {!readOnly && (
          <button type="button" onClick={onRemove}
            className="rounded-btn p-1.5 text-muted hover:text-crm-red hover:bg-crm-red-light transition-colors"
            aria-label="Supprimer le champ">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {needsOptions && !readOnly && (
        <div className="pl-7">
          <OptionsEditor value={field.options ?? []} onChange={(opts) => onUpdate({ options: opts })} />
        </div>
      )}
      {needsOptions && readOnly && (field.options?.length ?? 0) > 0 && (
        <div className="pl-7 flex flex-wrap gap-1.5">
          {field.options!.map((o) => (
            <span key={o} className="rounded-pill border border-primary/30 bg-primary-light px-2 py-0.5 text-xs text-primary">{o}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function OptionsEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed || value.includes(trimmed)) { setDraft(''); return }
    onChange([...value, trimmed])
    setDraft('')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Options</p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((opt) => (
            <span key={opt} className="inline-flex items-center gap-1 rounded-pill border border-primary/30 bg-primary-light px-2 py-0.5 text-xs text-primary">
              {opt}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== opt))} className="hover:text-crm-red" aria-label={`Supprimer ${opt}`}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Ajouter une option et appuyer sur Entrée"
          className={cn(inputClass, 'flex-1 text-xs')}
        />
        <button type="button" onClick={add} disabled={!draft.trim()}
          className="rounded-btn bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
          Ajouter
        </button>
      </div>
    </div>
  )
}
