import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import Toggle from '@/components/common/Toggle'
import { cn } from '@/lib/cn'
import type {
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

// Browser-safe uuid (avoids needing the uuid npm package).
function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// "Note moyenne" → "note_moyenne", deduped against existing keys.
function slugify(label: string, existing: Set<string>): string {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'champ'
  let key = base
  let i = 2
  while (existing.has(key)) {
    key = `${base}_${i++}`
  }
  return key
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

export default function CustomFieldsEditor() {
  const { customFieldsSchema, updateCustomFieldsSchema } = useTheme()
  const [schema, setSchema] = useState<CustomFieldsSchema>(customFieldsSchema)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(customFieldsSchema.sections.map(s => s.id))
  )

  useEffect(() => {
    setSchema(customFieldsSchema)
    setOpenSections(new Set(customFieldsSchema.sections.map(s => s.id)))
  }, [customFieldsSchema])

  const dirty = JSON.stringify(schema) !== JSON.stringify(customFieldsSchema)

  // --- section ops ----------------------------------------------------------

  const addSection = () => {
    const id = uid()
    setSchema(s => ({
      sections: [
        ...s.sections,
        { id, label: 'Nouvelle rubrique', position: s.sections.length, fields: [] },
      ],
    }))
    setOpenSections(prev => new Set(prev).add(id))
  }

  const updateSection = (id: string, patch: Partial<CustomSection>) => {
    setSchema(s => ({
      sections: s.sections.map(sec => (sec.id === id ? { ...sec, ...patch } : sec)),
    }))
  }

  const removeSection = (id: string) => {
    setSchema(s => ({
      sections: s.sections
        .filter(sec => sec.id !== id)
        .map((sec, idx) => ({ ...sec, position: idx })),
    }))
  }

  const moveSection = (id: string, dir: -1 | 1) => {
    setSchema(s => {
      const idx = s.sections.findIndex(sec => sec.id === id)
      if (idx < 0) return s
      return {
        sections: moveItem(s.sections, idx, idx + dir).map((sec, i) => ({ ...sec, position: i })),
      }
    })
  }

  // --- field ops ------------------------------------------------------------

  const addField = (sectionId: string) => {
    setSchema(s => {
      const keys = collectKeys(s)
      const label = 'Nouveau champ'
      return {
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
      sections: s.sections.map(sec => {
        if (sec.id !== sectionId) return sec
        return {
          ...sec,
          fields: sec.fields.map(f => {
            if (f.id !== fieldId) return f
            const next = { ...f, ...patch }
            // If the user renamed the label, regenerate the key — but only
            // if they hadn't manually overridden it (we treat "key" as
            // derived from "label" until the field is saved at least once).
            if (patch.label !== undefined && patch.key === undefined) {
              const keys = collectKeys(s, fieldId)
              next.key = slugify(patch.label, keys)
            }
            // If switching away from select/multiselect, drop options.
            if (patch.type !== undefined && !TYPES_WITH_OPTIONS.includes(patch.type)) {
              delete next.options
            }
            // If switching to select/multiselect, ensure options exists.
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
      sections: s.sections.map(sec =>
        sec.id !== sectionId ? sec : { ...sec, fields: sec.fields.filter(f => f.id !== fieldId) }
      ),
    }))
  }

  const moveField = (sectionId: string, fieldId: string, dir: -1 | 1) => {
    setSchema(s => ({
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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-text">Rubriques & champs personnalisés</h2>
        <p className="text-[13px] text-muted mt-0.5">
          Ajoutez vos propres rubriques et champs sur la fiche prospect, adaptés à votre métier.
        </p>
      </div>

      {schema.sections.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold text-text mb-1">Aucune rubrique personnalisée</p>
          <p className="text-[13px] text-muted mb-4">
            Créez votre première rubrique pour structurer des informations spécifiques à votre activité.
          </p>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary"
          >
            <Plus size={14} /> Créer une rubrique
          </button>
        </div>
      )}

      {schema.sections.map((section, sectionIdx) => {
        const isOpen = openSections.has(section.id)
        return (
          <div key={section.id} className="rounded-card border border-border bg-card overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-3">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveSection(section.id, -1)}
                  disabled={sectionIdx === 0}
                  className="text-muted hover:text-text disabled:opacity-30 disabled:hover:text-muted"
                  aria-label="Monter la rubrique"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section.id, 1)}
                  disabled={sectionIdx === schema.sections.length - 1}
                  className="text-muted hover:text-text disabled:opacity-30 disabled:hover:text-muted"
                  aria-label="Descendre la rubrique"
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
              <button
                type="button"
                onClick={() =>
                  setOpenSections(prev => {
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

            {/* Section body */}
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
                        sectionId={section.id}
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

      {schema.sections.length > 0 && (
        <div>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-btn border border-dashed border-border px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={14} /> Ajouter une rubrique
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
          Rubriques sauvegardées.
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
  sectionId: string
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
            className="text-muted hover:text-text disabled:opacity-30 disabled:hover:text-muted"
            aria-label="Monter le champ"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={isLast}
            className="text-muted hover:text-text disabled:opacity-30 disabled:hover:text-muted"
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
