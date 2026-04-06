import { Search, X } from 'lucide-react'
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
}

function Select({ value, onChange, children, className }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn('rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none', className)}
    >
      {children}
    </select>
  )
}

export default function ProspectFilters({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const hasFilters = filters.search || filters.stage || filters.priority || filters.channel || filters.service

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Rechercher…"
          className="rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none w-48"
        />
      </div>

      <Select value={filters.stage} onChange={v => set('stage', v as Filters['stage'])}>
        <option value="">Toutes les étapes</option>
        {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>

      <Select value={filters.priority} onChange={v => set('priority', v as Filters['priority'])}>
        <option value="">Toutes priorités</option>
        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
      </Select>

      <Select value={filters.channel} onChange={v => set('channel', v as Filters['channel'])}>
        <option value="">Tous les canaux</option>
        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      <Select value={filters.service} onChange={v => set('service', v)}>
        <option value="">Tous services</option>
        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>

      {hasFilters && (
        <button
          onClick={() => onChange({ search: '', stage: '', priority: '', channel: '', service: '' })}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={11} /> Effacer
        </button>
      )}
    </div>
  )
}
