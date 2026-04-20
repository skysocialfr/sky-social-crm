import { hexToHsl, hslToHex } from '@/lib/colorUtils'
import { cn } from '@/lib/cn'

const PRESETS = [
  { label: 'Bleu',      value: '217 91% 60%' },
  { label: 'Violet',    value: '262 83% 65%' },
  { label: 'Vert',      value: '160 84% 40%' },
  { label: 'Ambre',     value: '38 92% 55%'  },
  { label: 'Rose',      value: '347 77% 60%' },
  { label: 'Cyan',      value: '199 89% 50%' },
  { label: 'Orange',    value: '25 95% 55%'  },
  { label: 'Gris bleu', value: '215 20% 55%' },
]

interface ColorPickerProps {
  value: string
  onChange: (hsl: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const hexValue = hslToHex(value)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.label}
            onClick={() => onChange(preset.value)}
            className={cn(
              'h-8 w-8 rounded-full transition-all',
              value === preset.value && 'ring-2 ring-offset-2 ring-offset-card ring-white scale-110'
            )}
            style={{ background: `hsl(${preset.value})` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Personnalisé</label>
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <span className="text-xs text-muted-foreground font-mono">{hexValue}</span>
      </div>

      <div
        className="h-8 w-full rounded-lg border border-border"
        style={{ background: `hsl(${value})` }}
      />
    </div>
  )
}
