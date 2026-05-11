import { cn } from '@/lib/cn'
import Toggle from '@/components/common/Toggle'
import type { CustomField, CustomFieldValue } from '@/types'

const inputClass =
  'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

interface Props {
  field: CustomField
  value: CustomFieldValue | undefined
  onChange: (value: CustomFieldValue) => void
}

export default function DynamicFieldInput({ field, value, onChange }: Props) {
  switch (field.type) {
    case 'text':
    case 'url': {
      return (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          className={inputClass}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value || null)}
          placeholder={field.placeholder}
        />
      )
    }

    case 'textarea': {
      return (
        <textarea
          rows={3}
          className={cn(inputClass, 'resize-none')}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value || null)}
          placeholder={field.placeholder}
        />
      )
    }

    case 'number': {
      return (
        <input
          type="number"
          className={inputClass}
          value={value == null ? '' : String(value)}
          min={field.min}
          max={field.max}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={field.placeholder}
        />
      )
    }

    case 'date': {
      return (
        <input
          type="date"
          className={inputClass}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value || null)}
        />
      )
    }

    case 'boolean': {
      return (
        <div className="flex items-center gap-2 py-1.5">
          <Toggle checked={!!value} onChange={() => onChange(!value)} />
          <span className="text-xs text-muted-foreground">
            {value ? 'Oui' : 'Non'}
          </span>
        </div>
      )
    }

    case 'select': {
      const options = field.options ?? []
      return (
        <select
          className={inputClass}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value || null)}
        >
          <option value="">— Sélectionner —</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    case 'multiselect': {
      const options = field.options ?? []
      const selected = Array.isArray(value) ? (value as string[]) : []
      const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt])
      }
      return (
        <div className="flex flex-wrap gap-2">
          {options.length === 0 && (
            <p className="text-xs italic text-muted-foreground">Aucune option configurée.</p>
          )}
          {options.map(opt => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )
    }
  }
}
