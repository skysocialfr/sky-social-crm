import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'
import { STAGE_DOT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { PipelineStage, Prospect } from '@/types'

interface Props {
  stage: PipelineStage
  prospects: Prospect[]
  onAdd: (stage: PipelineStage) => void
}

export default function KanbanColumn({ stage, prospects, onAdd }: Props) {
  const totalValue = prospects.reduce((s, p) => s + (p.deal_value ?? 0), 0)
  const color = STAGE_DOT_COLORS[stage]

  return (
    <div className="flex w-[268px] flex-shrink-0 flex-col rounded-card border border-border bg-bg">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold text-text truncate">{stage}</span>
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
          <button
            onClick={() => onAdd(stage)}
            className="rounded-btn p-1 text-muted hover:text-text hover:bg-card transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <Droppable droppableId={stage}>
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
