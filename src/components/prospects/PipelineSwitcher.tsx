import { usePipelines } from '@/hooks/usePipelines'
import { cn } from '@/lib/cn'

interface Props {
  activeId: string | null
  onChange: (id: string) => void
}

// Tab bar at the top of ProspectsPage. Only shows when the team has
// 2+ pipelines — a single-pipeline team sees nothing (the legacy
// flow unchanged).
export default function PipelineSwitcher({ activeId, onChange }: Props) {
  const { data: pipelines = [] } = usePipelines()
  if (pipelines.length < 2) return null

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-card border border-border bg-card p-1">
      {pipelines.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            'rounded-btn px-3 py-1.5 text-xs font-semibold transition-colors',
            p.id === activeId
              ? 'bg-primary text-white shadow-primary'
              : 'text-muted hover:text-text hover:bg-bg'
          )}
        >
          {p.name}
          {p.is_default && (
            <span className="ml-1.5 text-[9px] uppercase tracking-wide opacity-70">
              défaut
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
