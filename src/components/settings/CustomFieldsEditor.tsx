import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, EyeOff, Eye, GripVertical, Check, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import Toggle from '@/components/common/Toggle'
import { cn } from '@/lib/cn'
import { BUILTIN_FIELDS } from '@/lib/builtinFields'
import { slugify } from '@/lib/slugify'
import {
  BUILTIN_TAB_ORDER,
  BUILTIN_TAB_DEFAULT_LABELS,
} from '@/types'
import type {
  BuiltInTab,
  CustomField,
  CustomFieldType,
  CustomSection,
  CustomFieldsSchema,
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
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function collectKeys(schema: CustomFieldsSchema, excludeId?: string): Set<string> {
  const set = new Set<string>()
  for (const s of schema.sections) {
    for (const f of s.fields) {
      if (f.id !== excludeId) set.add(f.key)
    }
  }
  return set
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function sectionsForTab(schema: CustomFieldsSchema, tab: BuiltInTab): CustomSection[] {
  return schema.sections
    .filter(s => s.tab === tab)
    .sort((a, b) => a.position - b.position)
}

export default function CustomFieldsEditor() {
  const { customFieldsSchema, updateCustomFieldsSchema } = useTheme()
  const [schema, setSchema] = useState<CustomFieldsSchema>(customFieldsSchema)
  const [activeTab, setActiveTab] = useState<BuiltInTab>('company')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set())
  const [renamingTab, setRenamingTab] = useState<BuiltInTab | null>(null)
  const [tabDraft, setTabDraft] = useState('')

  useEffect(() => {
    setSchema(customFieldsSchema)
  }, [customFieldsSchema])

  const dirty = JSON.stringify(schema) !== JSON.stringify(customFieldsSchema)

  // --- tab label ops --------------------------------------------------------

  const tabLabel = (tab: BuiltInTab): string =>
    schema.tabs[tab].label?.trim() || BUILTIN_TAB_DEFAULT_LABELS[tab]

  const startRename = (tab: BuiltInTab) => {
    setRenamingTab(tab)
    setTabDraft(tabLabel(tab))
  }

  const commitRename = () => {
    if (!renamingTab) return
    const next = tabDraft.trim()
    setSchema(s => ({
      ...s,
      tabs: {
        ...s.tabs,
        [renamingTab]: {
          ...s.tabs[renamingTab],
          label: next && next !== BUILTIN_TAB_DEFAULT_LABELS[renamingTab] ? next : undefined,
        },
      },
    }))
    setRenamingTab(null)
  }

  // --- field visibility -----------------------------------------------------

  const toggleFieldVisibility = (tab: BuiltInTab, key: string) => {
    setSchema(s => {
      const hidden = s.tabs[tab].hidden_fields
      const next = hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key]
      return { ...s, tabs: { ...s.tabs, [tab]: { ...s.tabs[tab], hidden_fields: next } } }
    })
  }

  // --- section ops ----------------------------------------------------------

  const addSection = (tab: BuiltInTab) => {
    const id = uid()
    setSchema(s => {
      const inTab = sectionsForTab(s, tab)
      return {
        ...s,
        sections: [
          ...s.sections,
          { id, label: 'Nouvelle rubrique', tab, position: inTab.length, fields: [] },
        ],
      }
    })
    setOpenSectionIds(prev => new Set(prev).add(id))
  }

  const updateSection = (id: string, patch: Partial<CustomSection>) => {
    setSchema(s => ({
      ...s,
      sections: s.sections.map(sec => (sec.id === id ? { ...sec, ...patch } : sec)),
    }))
  }

  const removeSection = (id: string) => {
    setSchema(s => ({
      ...s,
      sections: s.sections.filter(sec => sec.id !== id),
    }))
  }

  const moveSection = (id: string, dir: -1 | 1) => {
    setSchema(s => {
      const section = s.sections.find(sec => sec.id === id)
      if (!section) return s
      const inTab = sectionsForTab(s, section.tab)
      const idx = inTab.findIndex(sec => sec.id === id)
      const reordered = moveItem(inTab, idx, idx + dir)
      const positions = new Map(reordered.map((sec, i) => [sec.id, i]))
      return {
        ...s,
        sections: s.sections.map(sec =>
          positions.has(sec.id) ? { ...sec, position: positions.get(sec.id)! } : sec
        ),
      }
    })
  }

  // --- field ops ------------------------------------------------------------

  const addField = (sectionId: string) => {
    setSchema(s => {
      const keys = collectKeys(s)
      const label = 'Nouveau champ'
      return {
        ...s,
        sections: s.sections.map(sec =>
          sec.id !== sectionId
            ? sec
            : { ...sec, fields: [...sec.fields, { id: uid(), key: slugify(label, keys), label, type: 'text' }] }
        ),
      }
    })
  }

  const updateField = (sectionId: string, fieldId: string, patch: Partial<CustomField>) => {
    setSchema(s => ({
      ...s,
      sections: s.sections.map(sec => {
        if (sec.id !== sectionId) return sec
        return {
          ...sec,
          fields: sec.fields.map(f => {
            if (f.id !== fieldId) return f
            const next = { ...f, ...patch }
            if (patch.label !== undefined && patch.key === undefined) {
              const keys = collectKeys(s, fieldId)
              next.key = slugify(patch.label, keys)
            }
            if (patch.type !== undefined && !TYPES_WITH_OPTIONS.includes(patch.type)) {
              delete next.options
            }
            if (patch.type !== undefined && TYPES_WITH_OPTIONS.includes(patch.type) && !next.options) {
              next.options = []
            }
            return next
          }),
        }
      }),
    }))
  }

  const removeField = (sectionId: string, fieldId: string) => {
    setSchema(s => ({
      ...s,
      sections: s.sections.map(sec =>
        sec.id !== sectionId ? sec : { ...sec, fields: sec.fields.filter(f => f.id !== fieldId) }
      ),
    }))
  }

  const moveField = (sectionId: string, fieldId: string, dir: -1 | 1) => {
    setSchema(s => ({
      ...s,
      sections: s.sections.map(sec => {
        if (sec.id !== sectionId) return sec
        const idx = sec.fields.findIndex(f => f.id === fieldId)
        if (idx < 0) return sec
        return { ...sec, fields: moveItem(sec.fields, idx, idx + dir) }
      }),
    }))
  }

  // --- save -----------------------------------------------------------------

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateCustomFieldsSchema(schema)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  // --- render ---------------------------------------------------------------

  const builtinForActive = BUILTIN_FIELDS[activeTab]
  const sectionsInActive = sectionsForTab(schema, activeTab)
  const hiddenInActive = new Set(schema.tabs[activeTab].hidden_fields)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-text">Rubriques & champs</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Renommez les onglets, masquez les champs qui ne vous servent pas, et ajoutez vos propres rubriques.
        </p>
      </div>

      {/* Tab switcher with inline rename */}
      <div className="flex border-b border-border">
        {BUILTIN_TAB_ORDER.map(tab => {
          const isActive = activeTab === tab
          const isRenaming = renamingTab === tab
          return (
            <div
              key={tab}
              className={cn(
                'flex items-center gap-1 border-b-2 -mb-px px-1',
                isActive ? 'border-primary' : 'border-transparent'
              )}
            >
              {isRenaming ? (
                <div className="flex items-center gap-1 px-2 py-2">
                  <input
                    autoFocus
                    value={tabDraft}
                    onChange={e => setTabDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') setRenamingTab(null)
                    }}
                    className="rounded-btn border border-border bg-card px-2 py-1 text-sm font-medium focus:border-primary focus:outline-none"
                    style={{ width: `${Math.max(8, tabDraft.length)}ch` }}
                  />
                  <button
                    type="button"
                    onClick={commitRename}
                    className="text-crm-green hover:opacity-80"
                    aria-label="Valider"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingTab(null)}
                    className="text-muted hover:text-text"
                    aria-label="Annuler"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-3 py-3 text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted hover:text-text'
                    )}
                  >
                    {tabLabel(tab)}
                  </button>
                  <button
                    type="button"
                    onClick={() => startRename(tab)}
                    className="rounded-btn p-1 text-muted hover:text-primary hover:bg-bg transition-colors"
                    aria-label={`Renommer l'onglet ${tabLabel(tab)}`}
                  >
                    <Pencil size={12} />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Built-in fields visibility */}
      <div className="rounded-card border border-border bg-card">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Champs natifs de l'onglet « {tabLabel(activeTab)} »
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            Décochez les champs inutiles à votre activité. Les champs obligatoires (verrou) ne peuvent pas être masqués.
          </p>
        </div>
        <div className="divide-y divide-border">
          {builtinForActive.map(field => {
            const hidden = hiddenInActive.has(field.key)
            const locked = !!field.required
            return (
              <div key={field.key} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-2">
                  {hidden ? (
                    <EyeOff size={14} className="text-muted" />
                  ) : (
                    <Eye size={14} className="text-primary" />
                  )}
                  <span className={cn('text-sm', hidden ? 'text-muted line-through' : 'text-text')}>
                    {field.label}
                  </span>
                  {locked && (
                    <span className="rounded-pill bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                      obligatoire
                    </span>
                  )}
                </div>
                <Toggle
                  checked={!hidden}
                  onChange={() => toggleFieldVisibility(activeTab, field.key)}
                  disabled={locked}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom sections within the active tab */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Rubriques personnalisées
          </p>
          <button
            type="button"
            onClick={() => addSection(activeTab)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus size={12} /> Ajouter une rubrique
          </button>
        </div>

        {sectionsInActive.length === 0 && (
          <div className="rounded-card border border-dashed border-border bg-card px-5 py-6 text-center">
            <p className="text-[13px] text-muted">
              Aucune rubrique personnalisée dans cet onglet. Cliquez sur « Ajouter une rubrique » pour en créer une.
            </p>
          </div>
        )}

        {sectionsInActive.map((section, idx) => {
          const isOpen = openSectionIds.has(section.id)
          return (
            <div key={section.id} className="rounded-card border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, -1)}
                    disabled={idx === 0}
                    className="text-muted hover:text-text disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 1)}
                    disabled={idx === sectionsInActive.length - 1}
                    className="text-muted hover:text-text disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <GripVertical size={14} className="text-muted flex-shrink-0" />
                <input
                  value={section.label}
                  onChange={e => updateSection(section.id, { label: e.target.value })}
                  className="flex-1 rounded-btn border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-text hover:border-border focus:border-primary focus:outline-none"
                  placeholder="Nom de la rubrique"
                />
                <select
                  value={section.tab}
                  onChange={e => updateSection(section.id, { tab: e.target.value as BuiltInTab })}
                  className="rounded-btn border border-border bg-card px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
                  title="Onglet d'affichage"
                >
                  {BUILTIN_TAB_ORDER.map(t => (
                    <option key={t} value={t}>Onglet {tabLabel(t)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSectionIds(prev => {
                      const next = new Set(prev)
                      if (next.has(section.id)) next.delete(section.id)
                      else next.add(section.id)
                      return next
                    })
                  }
                  className="rounded-btn p-1.5 text-muted hover:text-text hover:bg-bg transition-colors"
                  aria-label={isOpen ? 'Réduire' : 'Déplier'}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="rounded-btn p-1.5 text-muted hover:text-crm-red hover:bg-crm-red-light transition-colors"
                  aria-label="Supprimer la rubrique"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {isOpen && (
                <div className="flex flex-col">
                  {section.fields.length === 0 ? (
                    <p className="px-5 py-4 text-[13px] text-muted text-center">
                      Aucun champ dans cette rubrique.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {section.fields.map((field, fieldIdx) => (
                        <FieldRow
                          key={field.id}
                          field={field}
                          isFirst={fieldIdx === 0}
                          isLast={fieldIdx === section.fields.length - 1}
                          onUpdate={patch => updateField(section.id, field.id, patch)}
                          onRemove={() => removeField(section.id, field.id)}
                          onMove={dir => moveField(section.id, field.id, dir)}
                        />
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border px-5 py-3">
                    <button
                      type="button"
                      onClick={() => addField(section.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Plus size={12} /> Ajouter un champ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
          Modifications sauvegardées.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={cn(
            'rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary',
            (!dirty || saving) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        {dirty && !saving && (
          <button
            type="button"
            onClick={() => setSchema(customFieldsSchema)}
            className="rounded-btn border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
          >
            Annuler les modifications
          </button>
        )}
      </div>
    </div>
  )
}

// --- subcomponents ---------------------------------------------------------

function FieldRow({
  field,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: {
  field: CustomField
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
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="text-muted hover:text-text disabled:opacity-30"
            aria-label="Monter le champ"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={isLast}
            className="text-muted hover:text-text disabled:opacity-30"
            aria-label="Descendre le champ"
          >
            <ChevronDown size={12} />
          </button>
        </div>
        <input
          value={field.label}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="Libellé du champ"
          className={cn(inputClass, 'flex-1')}
        />
        <select
          value={field.type}
          onChange={e => onUpdate({ type: e.target.value as CustomFieldType })}
          className={cn(inputClass, 'w-44')}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 px-2">
          <Toggle checked={!!field.required} onChange={() => onUpdate({ required: !field.required })} />
          <span className="text-[11px] text-muted">Requis</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-btn p-1.5 text-muted hover:text-crm-red hover:bg-crm-red-light transition-colors"
          aria-label="Supprimer le champ"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {needsOptions && (
        <div className="pl-7">
          <OptionsEditor
            value={field.options ?? []}
            onChange={opts => onUpdate({ options: opts })}
          />
        </div>
      )}
    </div>
  )
}

function OptionsEditor({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed || value.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...value, trimmed])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Options</p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(opt => (
            <span
              key={opt}
              className="inline-flex items-center gap-1 rounded-pill border border-primary/30 bg-primary-light px-2 py-0.5 text-xs text-primary"
            >
              {opt}
              <button
                type="button"
                onClick={() => onChange(value.filter(v => v !== opt))}
                className="hover:text-crm-red"
                aria-label={`Supprimer ${opt}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Ajouter une option et appuyer sur Entrée"
          className={cn(inputClass, 'flex-1 text-xs')}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="rounded-btn bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}
