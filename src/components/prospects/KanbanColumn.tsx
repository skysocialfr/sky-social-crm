import { Droppable } from '@hello-pangea/dnd'
import { Plus, AlertTriangle } from 'lucide-react'
import KanbanCard from './KanbanCard'
import { cn } from '@/lib/cn'
import type { Prospect } from '@/types'

interface Props {
  stage: string
  color: string
  prospects: Prospect[]
  onAdd: (stage: string) => void
  // The stage label isn't defined by the pipeline. Cards can be dragged
  // OUT to a real stage, but nothing can be added or dropped in.
  orphan?: boolean
}

export default function KanbanColumn({ stage, color, prospects, onAdd, orphan = false }: Props) {
  const totalValue = prospects.reduce((s, p) => s + (p.deal_value ?? 0), 0)

  return (
    <div
      className={cn(
        'flex w-[268px] flex-shrink-0 flex-col rounded-card border bg-bg',
        orphan ? 'border-dashed border-crm-amber' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          {orphan ? (
            <AlertTriangle size={12} className="flex-shrink-0 text-crm-amber" />
          ) : (
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          )}
          <span className="text-xs font-bold text-text truncate">{stage || 'Sans étape'}</span>
          <span className="rounded-pill bg-card border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted flex-shrink-0">
            {prospects.length}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {totalValue > 0 && (
            <span className="text-[10px] text-crm-green font-bold">
              {totalValue.toLocaleString('fr-FR')} €
            </span>
          )}
          {!orphan && (
            <button
              onClick={() => onAdd(stage)}
              className="rounded-btn p-1 text-muted hover:text-text hover:bg-card transition-colors"
            >
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {orphan && (
        <p className="border-b border-border bg-crm-amber-light px-3 py-2 text-[11px] leading-snug text-crm-amber">
          Cette étape n'existe pas dans ce lead. Glissez ces prospects vers une étape pour les reclasser.
        </p>
      )}

      <Droppable droppableId={stage} isDropDisabled={orphan}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 space-y-2 min-h-[120px] transition-colors',
              snapshot.isDraggingOver && 'bg-primary-light'
            )}
          >
            {prospects.map((p, i) => (
              <KanbanCard key={p.id} prospect={p} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
