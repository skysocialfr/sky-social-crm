import { useNavigate } from 'react-router-dom'
import { Draggable } from '@hello-pangea/dnd'
import { CalendarClock } from 'lucide-react'
import PriorityBadge from '@/components/common/PriorityBadge'
import ChannelIcon from '@/components/common/ChannelIcon'
import { dicebearAvatar } from '@/lib/avatar'
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
            'cursor-pointer rounded-card border border-border bg-card p-3 shadow-card hover:border-primary-border hover:shadow-md transition-all',
            snapshot.isDragging && 'shadow-modal border-primary rotate-1 scale-105'
          )}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <img
              src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
              alt=""
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text leading-tight truncate">{p.company_name}</p>
              <p className="text-[10px] text-muted truncate">
                {p.first_name} {p.last_name}
                {p.title ? ` · ${p.title}` : ''}
              </p>
            </div>
            <PriorityBadge priority={p.priority} className="flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between">
            <ChannelIcon channel={p.channel} />
            {p.deal_value != null && (
              <span className="text-xs font-bold text-crm-green">
                {p.deal_value.toLocaleString('fr-FR')} {p.currency}
              </span>
            )}
          </div>

          {p.next_followup_date && (
            <div
              className={cn(
                'mt-2 flex items-center gap-1 text-[10px]',
                isOverdue(p.next_followup_date) ? 'text-crm-red' : 'text-muted'
              )}
            >
              <CalendarClock size={10} />
              {formatDate(p.next_followup_date)}
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
