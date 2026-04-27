import { Search, X, SlidersHorizontal } from 'lucide-react'
import { PIPELINE_STAGES, PRIORITIES, CHANNELS, SERVICES } from '@/lib/constants'
import type { PipelineStage, ProspectPriority, ProspectingChannel } from '@/types'
import { cn } from '@/lib/cn'

export interface Filters {
  search: string
  stage: PipelineStage | ''
  priority: ProspectPriority | ''
  channel: ProspectingChannel | ''
  service: string
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
  advancedCount?: number
  onAdvancedToggle?: () => void
}

function Select({ value, onChange, children }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-btn border border-border bg-card px-3 py-2 text-xs text-text focus:border-primary focus:outline-none appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

export default function ProspectFilters({ filters, onChange, advancedCount = 0, onAdvancedToggle }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const hasFilters =
    filters.search || filters.stage || filters.priority || filters.channel || filters.service

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Rechercher…"
          className="rounded-btn border border-border bg-card pl-8 pr-3 py-2 text-xs text-text placeholder:text-subtle focus:border-primary focus:outline-none w-52"
        />
      </div>

      <Select value={filters.stage} onChange={(v) => set('stage', v as Filters['stage'])}>
        <option value="">Toutes les étapes</option>
        {PIPELINE_STAGES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      <Select value={filters.priority} onChange={(v) => set('priority', v as Filters['priority'])}>
        <option value="">Toutes priorités</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </Select>

      <Select value={filters.channel} onChange={(v) => set('channel', v as Filters['channel'])}>
        <option value="">Tous les canaux</option>
        {CHANNELS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>

      <Select value={filters.service} onChange={(v) => set('service', v)}>
        <option value="">Tous services</option>
        {SERVICES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      {onAdvancedToggle && (
        <button
          onClick={onAdvancedToggle}
          className={cn(
            'flex items-center gap-1.5 rounded-btn border px-3 py-2 text-xs font-semibold transition-colors',
            advancedCount > 0
              ? 'border-primary-border bg-primary-light text-primary'
              : 'border-border text-muted hover:text-text hover:bg-bg'
          )}
        >
          <SlidersHorizontal size={12} />
          Filtres avancés
          {advancedCount > 0 && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {advancedCount}
            </span>
          )}
        </button>
      )}

      {(hasFilters || advancedCount > 0) && (
        <button
          onClick={() => {
            onChange({ search: '', stage: '', priority: '', channel: '', service: '' })
          }}
          className="flex items-center gap-1 rounded-btn border border-border px-3 py-2 text-xs text-muted hover:text-text hover:bg-bg transition-colors"
        >
          <X size={11} /> Effacer
        </button>
      )}
    </div>
  )
}
