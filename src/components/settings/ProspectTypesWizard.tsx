import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { slugify } from '@/lib/slugify'
import { EXAMPLE_PROSPECT_TYPES, TYPE_COLOR_PRESETS, TYPE_EMOJI_PRESETS } from '@/lib/prospectTypes'
import type { CustomField, CustomFieldType, ProspectType } from '@/types'

// A friendly, step-by-step setup assistant that walks any client
// through creating their prospect types from scratch — no docs needed:
//   1. "What kinds of prospects do you track?" (suggestions + custom)
//   2. "What do you want to record for each one?" (per type, with
//      suggested fields + a title field)
//   3. Recap → create.
// It produces ProspectType[] and hands them back via onComplete; the
// editor merges + saves them.

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const inputClass =
  'w-full rounded-btn border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none'

type WizField = {
  id: string
  label: string
  type: CustomFieldType
  required: boolean
  is_title: boolean
}

type WizType = {
  id: string
  exampleId?: string
  label: string
  emoji: string
  color: string
  description?: string
  fields: WizField[]
}

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Texte', textarea: 'Texte long', number: 'Nombre', boolean: 'Oui / Non',
  date: 'Date', select: 'Liste', multiselect: 'Choix multiple', url: 'Lien',
}

// Common fields offered as one-click chips in step 2.
const SUGGESTED_FIELDS: { label: string; type: CustomFieldType }[] = [
  { label: 'Nom', type: 'text' },
  { label: 'Email', type: 'text' },
  { label: 'Téléphone', type: 'text' },
  { label: 'Ville', type: 'text' },
  { label: 'Site web', type: 'url' },
  { label: 'Instagram', type: 'url' },
  { label: 'Budget estimé', type: 'number' },
  { label: 'Spécialité', type: 'text' },
  { label: 'Notes', type: 'textarea' },
]

const defaultFields = (): WizField[] => [
  { id: uid(), label: 'Nom', type: 'text', required: true, is_title: true },
  { id: uid(), label: 'Email', type: 'text', required: false, is_title: false },
  { id: uid(), label: 'Téléphone', type: 'text', required: false, is_title: false },
  { id: uid(), label: 'Notes', type: 'textarea', required: false, is_title: false },
]

const fromExample = (ex: ProspectType, i: number): WizType => ({
  id: uid(),
  exampleId: ex.id,
  label: ex.label,
  emoji: ex.emoji || TYPE_EMOJI_PRESETS[i % TYPE_EMOJI_PRESETS.length],
  color: ex.color || TYPE_COLOR_PRESETS[i % TYPE_COLOR_PRESETS.length],
  description: ex.description,
  fields: ex.fields.map((f) => ({
    id: uid(),
    label: f.label,
    type: f.type,
    required: !!f.required,
    is_title: !!f.is_title,
  })),
})

// Convert the wizard drafts into real ProspectType[] with stable keys
// and a guaranteed single title field per type.
export function buildTypes(drafts: WizType[]): ProspectType[] {
  return drafts.map((t, idx) => {
    const typeSlug = slugify(t.label || 'type', new Set())
    const used = new Set<string>()
    const hasTitle = t.fields.some((f) => f.is_title)
    const fields: CustomField[] = t.fields
      .filter((f) => f.label.trim())
      .map((f, fi) => {
        const key = slugify(`${typeSlug}_${f.label}`, used)
        used.add(key)
        return {
          id: uid(),
          key,
          label: f.label.trim(),
          type: f.type,
          required: f.required,
          is_title: f.is_title || (!hasTitle && fi === 0),
        }
      })
    return {
      id: uid(),
      label: t.label.trim() || 'Type',
      emoji: t.emoji,
      color: t.color,
      description: t.description,
      fields,
      position: idx,
    }
  })
}

export default function ProspectTypesWizard({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onComplete: (types: ProspectType[]) => Promise<void> | void
}) {
  const [step, setStep] = useState(1)
  const [drafts, setDrafts] = useState<WizType[]>([])
  const [cursor, setCursor] = useState(0)
  const [customLabel, setCustomLabel] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1)
      setDrafts([])
      setCursor(0)
      setCustomLabel('')
      setSaving(false)
    }
  }, [open])

  const toggleExample = (ex: ProspectType, i: number) => {
    setDrafts((prev) => {
      const existing = prev.find((d) => d.exampleId === ex.id)
      if (existing) return prev.filter((d) => d.id !== existing.id)
      return [...prev, fromExample(ex, prev.length + i)]
    })
  }

  const addCustom = () => {
    const label = customLabel.trim()
    if (!label) return
    setDrafts((prev) => [
      ...prev,
      {
        id: uid(),
        label,
        emoji: TYPE_EMOJI_PRESETS[prev.length % TYPE_EMOJI_PRESETS.length],
        color: TYPE_COLOR_PRESETS[prev.length % TYPE_COLOR_PRESETS.length],
        fields: defaultFields(),
      },
    ])
    setCustomLabel('')
  }

  const removeDraft = (id: string) =>
    setDrafts((prev) => prev.filter((d) => d.id !== id))

  const patchDraft = (id: string, patch: Partial<WizType>) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))

  const current = drafts[cursor]

  const patchField = (draftId: string, fieldId: string, patch: Partial<WizField>) =>
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d
        if (patch.is_title) {
          return { ...d, fields: d.fields.map((f) => ({ ...f, is_title: f.id === fieldId })) }
        }
        return { ...d, fields: d.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) }
      }),
    )

  const addField = (draftId: string, label = 'Nouveau champ', type: CustomFieldType = 'text') =>
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId
          ? { ...d, fields: [...d.fields, { id: uid(), label, type, required: false, is_title: false }] }
          : d,
      ),
    )

  const removeField = (draftId: string, fieldId: string) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, fields: d.fields.filter((f) => f.id !== fieldId) } : d)),
    )

  const goNext = () => {
    if (step === 1) {
      if (!drafts.length) return
      setCursor(0)
      setStep(2)
    } else if (step === 2) {
      if (cursor < drafts.length - 1) setCursor((c) => c + 1)
      else setStep(3)
    }
  }

  const goBack = () => {
    if (step === 3) {
      setStep(2)
      setCursor(drafts.length - 1)
    } else if (step === 2) {
      if (cursor > 0) setCursor((c) => c - 1)
      else setStep(1)
    }
  }

  const finish = async () => {
    setSaving(true)
    try {
      await onComplete(buildTypes(drafts))
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-card md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:border md:border-border md:shadow-2xl md:max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-bold text-text">Assistant de configuration</Dialog.Title>
              <p className="text-[11px] text-muted mt-0.5">Étape {step} sur 3</p>
            </div>
            <Dialog.Close className="rounded-md p-1 text-muted hover:text-text hover:bg-bg transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* STEP 1 — choose types */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-bold text-text">Quels types de prospects gérez-vous ?</h3>
                  <p className="text-[13px] text-muted mt-1">
                    Choisissez parmi les suggestions ou ajoutez les vôtres. Vous préciserez ensuite les
                    informations à enregistrer pour chacun.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Suggestions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXAMPLE_PROSPECT_TYPES.map((ex, i) => {
                      const active = drafts.some((d) => d.exampleId === ex.id)
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => toggleExample(ex, i)}
                          className={cn(
                            'group flex items-center gap-3 rounded-card border px-3 py-2.5 text-left transition-all',
                            active ? 'border-primary bg-primary-light' : 'border-border hover:border-primary',
                          )}
                        >
                          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-btn text-lg"
                            style={{ background: `${ex.color || '#6366f1'}1a` }}>
                            {ex.emoji || '👤'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-text truncate">{ex.label}</span>
                            {ex.description && <span className="block text-[11px] text-muted truncate">{ex.description}</span>}
                          </span>
                          {active && <Check size={16} className="text-primary flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Type personnalisé</p>
                  <div className="flex gap-2">
                    <input
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                      placeholder="Ex: Restaurant, Coach sportif, Boutique…"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addCustom}
                      disabled={!customLabel.trim()}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-btn bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      <Plus size={13} /> Ajouter
                    </button>
                  </div>
                </div>

                {drafts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Sélectionnés ({drafts.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {drafts.map((d) => (
                        <span key={d.id} className="inline-flex items-center gap-1.5 rounded-pill border border-primary bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                          <span aria-hidden>{d.emoji}</span> {d.label}
                          <button type="button" onClick={() => removeDraft(d.id)} className="hover:text-crm-red" aria-label={`Retirer ${d.label}`}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — fields per type */}
            {step === 2 && current && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-btn text-xl"
                    style={{ background: `${current.color}1a` }}>
                    {current.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted">Type {cursor + 1} / {drafts.length}</p>
                    <input
                      value={current.label}
                      onChange={(e) => patchDraft(current.id, { label: e.target.value })}
                      className="w-full bg-transparent text-lg font-bold text-text focus:outline-none"
                    />
                  </div>
                </div>

                <p className="text-[13px] text-muted">
                  Quelles informations veux-tu enregistrer pour ce type ? Coche « Titre » sur le champ
                  qui sert de nom (affiché dans les listes).
                </p>

                <div className="flex flex-col gap-2">
                  {current.fields.map((f) => (
                    <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-btn border border-border bg-bg p-2">
                      <input
                        value={f.label}
                        onChange={(e) => patchField(current.id, f.id, { label: e.target.value })}
                        placeholder="Libellé"
                        className="flex-1 min-w-[7rem] rounded-btn border border-border bg-card px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => patchField(current.id, f.id, { type: e.target.value as CustomFieldType })}
                        className="rounded-btn border border-border bg-card px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
                      >
                        {(Object.keys(FIELD_TYPE_LABELS) as CustomFieldType[]).map((t) => (
                          <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => patchField(current.id, f.id, { is_title: true })}
                        className={cn(
                          'rounded-pill border px-2 py-1 text-[11px] font-semibold transition-colors',
                          f.is_title ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted hover:text-text',
                        )}
                        title="Sert de nom du prospect"
                      >
                        Titre
                      </button>
                      <button
                        type="button"
                        onClick={() => patchField(current.id, f.id, { required: !f.required })}
                        className={cn(
                          'rounded-pill border px-2 py-1 text-[11px] font-semibold transition-colors',
                          f.required ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted hover:text-text',
                        )}
                      >
                        Requis
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(current.id, f.id)}
                        className="rounded-btn p-1.5 text-muted hover:text-crm-red transition-colors"
                        aria-label="Supprimer le champ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] text-muted mb-1.5">Ajouter rapidement :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_FIELDS.filter(
                      (s) => !current.fields.some((f) => f.label.toLowerCase() === s.label.toLowerCase()),
                    ).map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => addField(current.id, s.label, s.type)}
                        className="inline-flex items-center gap-1 rounded-pill border border-dashed border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus size={11} /> {s.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(current.id)}
                      className="inline-flex items-center gap-1 rounded-pill border border-dashed border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus size={11} /> Champ libre
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — recap */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Tout est prêt 🎉</h3>
                  <p className="text-[13px] text-muted mt-1">
                    Voici ce qui va être créé. Tu pourras tout modifier ensuite depuis les paramètres.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {drafts.map((d) => {
                    const titleField = d.fields.find((f) => f.is_title) ?? d.fields[0]
                    return (
                      <div key={d.id} className="flex items-center gap-3 rounded-card border border-border bg-bg p-3">
                        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-btn text-lg"
                          style={{ background: `${d.color}1a` }}>
                          {d.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-text truncate">{d.label}</p>
                          <p className="text-[12px] text-muted truncate">
                            {d.fields.length} champ{d.fields.length !== 1 ? 's' : ''}
                            {titleField ? ` · titre : ${titleField.label}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 rounded-btn border border-border px-3 py-2 text-xs font-semibold text-muted hover:bg-bg transition-colors disabled:opacity-40"
            >
              <ArrowLeft size={13} /> Précédent
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 1 && drafts.length === 0}
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {step === 2 && cursor === drafts.length - 1 ? 'Voir le récap' : 'Suivant'} <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={saving || drafts.length === 0}
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                <Check size={13} /> {saving ? 'Création…' : 'Créer mes types'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
