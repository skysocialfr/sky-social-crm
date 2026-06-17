import { useState } from 'react'
import { Eye, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { discriminatorCandidates } from '@/lib/visibility'
import type { CustomFieldsSchema, VisibilityRule } from '@/types'

interface Props {
  rule: VisibilityRule | undefined
  onChange: (rule: VisibilityRule | undefined) => void
  schema: CustomFieldsSchema
  // Optional: pretty label for the thing this rule controls
  // (e.g. "cette rubrique" / "ce champ").
  label?: string
  // Visual variant: 'inline' = a banner inside a card,
  //                 'compact' = a small chip useful next to native fields.
  variant?: 'inline' | 'compact'
}

// Lets the team owner attach a "visible only when X = [Y, Z]" rule
// to a section or a native field. The discriminator is any select
// or multi-select rubric defined in the schema.
//
// Empty values list → treated as "always visible" by the rule
// engine (see lib/visibility.ts), so we collapse the editor back
// to the inactive state in that case.
export default function VisibilityRuleEditor({
  rule,
  onChange,
  schema,
  label = 'cette rubrique',
  variant = 'inline',
}: Props) {
  const candidates = discriminatorCandidates(schema)
  const [open, setOpen] = useState(false)

  const active = !!rule && rule.values.length > 0
  const currentField = active ? candidates.find(c => c.key === rule!.field_key) : null

  // Even if no candidates exist yet, we still show the entry so the
  // owner understands the feature — disabled with a helper message.
  const hasCandidates = candidates.length > 0

  const summary = active
    ? `Visible si ${currentField?.label ?? rule!.field_key} ∈ ${rule!.values.join(', ')}`
    : 'Toujours visible'

  const clear = () => onChange(undefined)
  const toggleValue = (value: string) => {
    if (!rule) return
    const has = rule.values.includes(value)
    const nextValues = has ? rule.values.filter(v => v !== value) : [...rule.values, value]
    if (nextValues.length === 0) {
      onChange(undefined)
    } else {
      onChange({ ...rule, values: nextValues })
    }
  }
  const pickDiscriminator = (key: string) => {
    onChange({ field_key: key, values: [] })
  }

  if (variant === 'compact') {
    return (
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[10px] font-semibold transition-colors',
            active
              ? 'border-primary-border bg-primary-light text-primary'
              : 'border-border bg-card text-muted hover:text-text'
          )}
          title={summary}
        >
          <Eye size={10} />
          {active ? 'Conditionnel' : 'Toujours'}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full right-0 mt-1 z-20 w-72 rounded-card border border-border bg-card p-3 shadow-modal">
              <Editor
                rule={rule}
                schema={schema}
                onChange={onChange}
                onClear={clear}
                onPickDiscriminator={pickDiscriminator}
                onToggleValue={toggleValue}
                hasCandidates={hasCandidates}
                label={label}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  // inline variant
  return (
    <div className="rounded-btn border border-border bg-bg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Eye size={12} className={active ? 'text-primary' : 'text-muted'} />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Visibilité de {label}
          </p>
        </div>
        {active && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-medium text-muted hover:text-crm-red hover:bg-card transition-colors"
            title="Retirer la condition (toujours visible)"
          >
            <X size={11} /> Retirer
          </button>
        )}
      </div>
      <Editor
        rule={rule}
        schema={schema}
        onChange={onChange}
        onClear={clear}
        onPickDiscriminator={pickDiscriminator}
        onToggleValue={toggleValue}
        hasCandidates={hasCandidates}
        label={label}
      />
    </div>
  )
}

function Editor({
  rule,
  schema,
  onPickDiscriminator,
  onToggleValue,
  hasCandidates,
  label,
}: {
  rule: VisibilityRule | undefined
  schema: CustomFieldsSchema
  onChange: (r: VisibilityRule | undefined) => void
  onClear: () => void
  onPickDiscriminator: (key: string) => void
  onToggleValue: (v: string) => void
  hasCandidates: boolean
  label: string
}) {
  const candidates = discriminatorCandidates(schema)
  const currentField = rule ? candidates.find(c => c.key === rule.field_key) : null

  if (!hasCandidates) {
    return (
      <p className="text-[12px] text-muted leading-snug">
        Crée d'abord une rubrique de type liste déroulante (ex: « Type d'acteur ») —
        elle servira de critère pour rendre {label} conditionnelle.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[12px] text-muted">
        <span>Afficher quand</span>
        <select
          value={rule?.field_key ?? ''}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return
            onPickDiscriminator(v)
          }}
          className="flex-1 rounded-btn border border-border bg-card px-2 py-1 text-[12px] text-text focus:border-primary focus:outline-none"
        >
          <option value="">— Choisis une rubrique —</option>
          {candidates.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <span>=</span>
      </div>

      {currentField ? (
        <div className="flex flex-wrap gap-1.5">
          {currentField.options.map(opt => {
            const active = rule?.values.includes(opt) ?? false
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleValue(opt)}
                className={cn(
                  'rounded-pill border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-white shadow-primary'
                    : 'border-border bg-card text-text hover:border-primary'
                )}
              >
                {opt}
              </button>
            )
          })}
          {currentField.options.length === 0 && (
            <p className="text-[11px] text-muted">
              Cette rubrique n'a aucune option. Ajoute-en pour pouvoir filtrer dessus.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted">
          Sélectionne une rubrique pour voir ses valeurs.
        </p>
      )}
    </div>
  )
}
