import { CalendarClock, X } from 'lucide-react'
import { useUpdateProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import { formatDate, isOverdue } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'

interface Props {
  prospectId: string
  date: string | null
}

export default function FollowUpScheduler({ prospectId, date }: Props) {
  const update = useUpdateProspect()
  const { toast } = useToast()

  const save = (val: string) => {
    update.mutate(
      { id: prospectId, data: { next_followup_date: val || null } },
      { onSuccess: () => toast('Date de relance mise à jour') }
    )
  }

  const clear = () => {
    update.mutate(
      { id: prospectId, data: { next_followup_date: null } },
      { onSuccess: () => toast('Date de relance effacée') }
    )
  }

  const overdue = isOverdue(date)

  return (
    <div className={cn('rounded-xl border bg-card p-4', overdue ? 'border-red-700 bg-red-900/10' : 'border-border')}>
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={14} className={overdue ? 'text-red-400' : 'text-muted-foreground'} />
        <p className={cn('text-xs font-semibold uppercase tracking-wide', overdue ? 'text-red-400' : 'text-muted-foreground')}>
          Prochain contact {overdue && '— EN RETARD'}
        </p>
      </div>
      {date && (
        <p className={cn('mb-2 text-sm font-medium', overdue ? 'text-red-300' : 'text-foreground')}>
          {formatDate(date)}
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="date"
          defaultValue={date ?? ''}
          onBlur={(e) => save(e.target.value)}
          className="rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none flex-1"
        />
        {date && (
          <button onClick={clear} className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
