import { useNavigate } from 'react-router-dom'
import { Draggable } from '@hello-pangea/dnd'
import { CalendarClock } from 'lucide-react'
import PriorityBadge from '@/components/common/PriorityBadge'
import ChannelIcon from '@/components/common/ChannelIcon'
import { formatDate, isOverdue } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'
import type { Prospect } from '@/types'

interface Props {
  prospect: Prospect
  index: number
}

export default function KanbanCard({ prospect: p, index }: Props) {
  const navigate = useNavigate()

  return (
    <Draggable draggableId={p.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/app/prospects/${p.id}`)}
          className={cn(
            'cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/50 hover:shadow-md transition-all',
            snapshot.isDragging && 'shadow-xl border-primary/60 rotate-1 scale-105'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-foreground leading-tight">{p.company_name}</p>
            <PriorityBadge priority={p.priority} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {p.first_name} {p.last_name}
            {p.title && ` · ${p.title}`}
          </p>
          <div className="flex items-center justify-between">
            <ChannelIcon channel={p.channel} />
            {p.deal_value && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {p.deal_value.toLocaleString('fr-FR')} {p.currency}
              </span>
            )}
          </div>
          {p.next_followup_date && (
            <div className={cn(
              'mt-2 flex items-center gap-1 text-xs',
              isOverdue(p.next_followup_date) ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
            )}>
              <CalendarClock size={11} />
              {formatDate(p.next_followup_date)}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
