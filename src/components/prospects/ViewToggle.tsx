import { LayoutGrid, Table2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  view: 'kanban' | 'table'
  onChange: (view: 'kanban' | 'table') => void
}

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => onChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
          view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <Table2 size={13} />
        Tableau
      </button>
      <button
        onClick={() => onChange('kanban')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
          view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <LayoutGrid size={13} />
        Kanban
      </button>
    </div>
  )
}
