import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, CheckCheck } from 'lucide-react'
import { useRelances } from '@/hooks/useRelances'
import { useCreateInteraction } from '@/hooks/useInteractions'
import { useUpdateProspect } from '@/hooks/useProspects'
import { useQueryClient } from '@tanstack/react-query'
import PriorityBadge from '@/components/common/PriorityBadge'
import StageBadge from '@/components/common/StageBadge'
import ChannelIcon from '@/components/common/ChannelIcon'
import EmptyState from '@/components/common/EmptyState'
import { useToast } from '@/components/common/Toast'
import { formatDate, isOverdue, isDueToday } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'
import type { Prospect } from '@/types'

function ReschedulePopover({ prospect, onDone }: { prospect: Prospect; onDone: () => void }) {
  const update = useUpdateProspect()
  const { toast } = useToast()
  const [date, setDate] = useState('')

  const save = async () => {
    if (!date) return
    await update.mutateAsync({ id: prospect.id, data: { next_followup_date: date } })
    toast('Relance reprogrammée !')
    onDone()
  }

  return (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="rounded-md border border-border bg-input px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
      />
      <button
        onClick={save}
        disabled={!date}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        OK
      </button>
    </div>
  )
}

export default function RelancesPage() {
  const { data: relances = [], isLoading } = useRelances()
  const createInteraction = useCreateInteraction()
  const update = useUpdateProspect()
  const qc = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [contactingId, setContactingId] = useState<string | null>(null)

  const handleMarkContacted = async (prospect: Prospect) => {
    setContactingId(prospect.id)
    try {
      await createInteraction.mutateAsync({
        prospect_id: prospect.id,
        type: 'Note interne',
        date: new Date().toISOString(),
        summary: 'Contacté (marqué depuis la page Relances)',
      })
      await update.mutateAsync({ id: prospect.id, data: { next_followup_date: null } })
      qc.invalidateQueries({ queryKey: ['relances'] })
      toast('Marqué comme contacté !')
    } finally {
      setContactingId(null)
    }
  }

  const overdue = relances.filter(p => isOverdue(p.next_followup_date) && !isDueToday(p.next_followup_date))
  const today = relances.filter(p => isDueToday(p.next_followup_date))

  if (isLoading) return <div className="text-muted-foreground text-sm">Chargement…</div>

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Relances</h1>
        <p className="text-sm text-muted-foreground">
          {relances.length === 0
            ? 'Aucune relance en attente — vous êtes à jour !'
            : `${relances.length} relance${relances.length > 1 ? 's' : ''} à effectuer`}
        </p>
      </div>

      {relances.length === 0 && (
        <EmptyState
          icon={CheckCheck}
          title="Tout est à jour !"
          description="Aucune relance en retard ni prévue aujourd'hui."
        />
      )}

      {overdue.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
            <Bell size={14} /> En retard ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map(p => (
              <ProspectRow
                key={p.id}
                prospect={p}
                overdue
                isContacting={contactingId === p.id}
                isRescheduling={rescheduleId === p.id}
                onNavigate={() => navigate(`/prospects/${p.id}`)}
                onContact={() => handleMarkContacted(p)}
                onReschedule={() => setRescheduleId(rescheduleId === p.id ? null : p.id)}
                onRescheduleDone={() => setRescheduleId(null)}
              />
            ))}
          </div>
        </section>
      )}

      {today.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Calendar size={14} /> Aujourd'hui ({today.length})
          </h2>
          <div className="space-y-2">
            {today.map(p => (
              <ProspectRow
                key={p.id}
                prospect={p}
                overdue={false}
                isContacting={contactingId === p.id}
                isRescheduling={rescheduleId === p.id}
                onNavigate={() => navigate(`/prospects/${p.id}`)}
                onContact={() => handleMarkContacted(p)}
                onReschedule={() => setRescheduleId(rescheduleId === p.id ? null : p.id)}
                onRescheduleDone={() => setRescheduleId(null)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProspectRow({
  prospect: p,
  overdue,
  isContacting,
  isRescheduling,
  onNavigate,
  onContact,
  onReschedule,
  onRescheduleDone,
}: {
  prospect: Prospect
  overdue: boolean
  isContacting: boolean
  isRescheduling: boolean
  onNavigate: () => void
  onContact: () => void
  onReschedule: () => void
  onRescheduleDone: () => void
}) {
  return (
    <div className={cn(
      'rounded-xl border bg-card p-4',
      overdue ? 'border-red-800 bg-red-900/5' : 'border-border'
    )}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <button onClick={onNavigate} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
          {p.company_name}
        </button>
        <PriorityBadge priority={p.priority} />
        <StageBadge stage={p.stage} />
        <ChannelIcon channel={p.channel} showLabel />
        <span className={cn('ml-auto text-xs font-medium', overdue ? 'text-red-400' : 'text-amber-400')}>
          {overdue ? '⚠ En retard · ' : '📅 '}{formatDate(p.next_followup_date)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {p.first_name} {p.last_name}{p.title ? ` · ${p.title}` : ''}
        {p.email ? ` · ${p.email}` : ''}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onContact}
          disabled={isContacting}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <CheckCheck size={12} />
          {isContacting ? 'Enregistrement…' : 'Marquer contacté'}
        </button>
        <button
          onClick={onReschedule}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Calendar size={12} /> Reprogrammer
        </button>
        {isRescheduling && (
          <div className="w-full mt-2">
            <ReschedulePopover prospect={p} onDone={onRescheduleDone} />
          </div>
        )}
      </div>
    </div>
  )
}
