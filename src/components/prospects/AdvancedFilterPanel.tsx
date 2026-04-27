import { useState } from 'react'
import { X, Plus, Trash2, BookmarkPlus } from 'lucide-react'
import {
  FILTER_FIELDS,
  TEXT_OPERATORS,
  NUMBER_OPERATORS,
  type FilterCondition,
} from '@/lib/filterUtils'

interface SavedPreset {
  name: string
  conditions: FilterCondition[]
}

const PRESETS_KEY = 'crm-adv-presets'

function loadPresets(): SavedPreset[] {
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]')
  } catch {
    return []
  }
}

interface Props {
  open: boolean
  onClose: () => void
  conditions: FilterCondition[]
  onChange: (conditions: FilterCondition[]) => void
}

export default function AdvancedFilterPanel({ open, onClose, conditions, onChange }: Props) {
  const [presets, setPresets] = useState<SavedPreset[]>(loadPresets)
  const [presetName, setPresetName] = useState('')
  const [showSave, setShowSave] = useState(false)

  const addCondition = () =>
    onChange([...conditions, { field: 'company_name', operator: 'contains', value: '' }])

  const removeCondition = (i: number) =>
    onChange(conditions.filter((_, j) => j !== i))

  const updateCondition = (i: number, patch: Partial<FilterCondition>) =>
    onChange(conditions.map((c, j) => (j === i ? { ...c, ...patch } : c)))

  const handleSavePreset = () => {
    if (!presetName.trim() || conditions.length === 0) return
    const updated = [
      { name: presetName.trim(), conditions },
      ...presets.filter((p) => p.name !== presetName.trim()),
    ]
    setPresets(updated)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated))
    setPresetName('')
    setShowSave(false)
  }

  const deletePreset = (name: string) => {
    const updated = presets.filter((p) => p.name !== name)
    setPresets(updated)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated))
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/10" onClick={onClose} />
      <div className="fixed right-0 top-0 z-40 h-full w-96 bg-card border-l border-border shadow-modal flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-text">⚡ Filtres avancés</p>
            <p className="text-[11px] text-muted mt-0.5">
              {conditions.length} condition{conditions.length !== 1 ? 's' : ''} — logique ET
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text rounded-btn transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {conditions.map((cond, i) => {
            const field = FILTER_FIELDS.find((f) => f.key === cond.field)
            const ops = field?.type === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS
            const noValue = ['is_empty', 'is_not_empty'].includes(cond.operator)
            return (
              <div
                key={i}
                className="rounded-btn border border-border bg-bg p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-subtle uppercase tracking-wider">
                    Condition {i + 1}
                  </span>
                  <button
                    onClick={() => removeCondition(i)}
                    className="text-muted hover:text-crm-red transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <select
                  value={cond.field}
                  onChange={(e) =>
                    updateCondition(i, { field: e.target.value, operator: 'contains', value: '' })
                  }
                  className="w-full rounded-btn border border-border bg-card px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
                >
                  {FILTER_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(i, { operator: e.target.value })}
                  className="w-full rounded-btn border border-border bg-card px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
                >
                  {ops.map((op) => (
                    <option key={op.key} value={op.key}>
                      {op.label}
                    </option>
                  ))}
                </select>
                {!noValue && (
                  <input
                    value={cond.value}
                    onChange={(e) => updateCondition(i, { value: e.target.value })}
                    placeholder="Valeur…"
                    className="w-full rounded-btn border border-border bg-card px-2.5 py-1.5 text-xs text-text placeholder:text-subtle focus:border-primary focus:outline-none"
                  />
                )}
              </div>
            )
          })}

          <button
            onClick={addCondition}
            className="flex items-center justify-center gap-2 rounded-btn border border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted hover:border-primary hover:text-primary transition-colors w-full"
          >
            <Plus size={13} /> Ajouter une condition
          </button>

          {presets.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2">
                Filtres sauvegardés
              </p>
              <div className="flex flex-col gap-1.5">
                {presets.map((preset) => (
                  <div
                    key={preset.name}
                    className="flex items-center gap-2 rounded-btn border border-border bg-bg px-3 py-2"
                  >
                    <button
                      onClick={() => onChange(preset.conditions)}
                      className="flex-1 text-left text-xs font-semibold text-text hover:text-primary transition-colors"
                    >
                      {preset.name}
                      <span className="font-normal text-muted ml-1">
                        ({preset.conditions.length} cond.)
                      </span>
                    </button>
                    <button
                      onClick={() => deletePreset(preset.name)}
                      className="text-muted hover:text-crm-red transition-colors flex-shrink-0"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex-shrink-0">
          {showSave ? (
            <div className="flex gap-2">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                placeholder="Nom du filtre…"
                autoFocus
                className="flex-1 rounded-btn border border-border bg-card px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="rounded-btn bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                OK
              </button>
              <button
                onClick={() => setShowSave(false)}
                className="rounded-btn border border-border px-3 py-2 text-xs text-muted hover:text-text transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onChange([])}
                className="flex-1 rounded-btn border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
              >
                Effacer tout
              </button>
              <button
                onClick={() => setShowSave(true)}
                disabled={conditions.length === 0}
                className="flex items-center gap-1.5 rounded-btn border border-primary-border bg-primary-light px-3 py-2 text-xs font-bold text-primary hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                <BookmarkPlus size={12} /> Sauvegarder
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
