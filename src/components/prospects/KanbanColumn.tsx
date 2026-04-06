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
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-border bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold text-foreground">{stage}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {prospects.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalValue > 0 && (
            <span className="text-[10px] text-emerald-400 font-medium">
              {totalValue.toLocaleString('fr-FR')} €
            </span>
          )}
          <button
            onClick={() => onAdd(stage)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 space-y-2 min-h-[120px] transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5'
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
