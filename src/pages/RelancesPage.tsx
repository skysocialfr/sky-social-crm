import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCheck, Calendar, List, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  parseISO, isBefore, isToday, isAfter, startOfDay,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, format,
  addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useProspects, useUpdateProspect } from '@/hooks/useProspects'
import { useCreateInteraction } from '@/hooks/useInteractions'
import { useQueryClient } from '@tanstack/react-query'
import { dicebearAvatar } from '@/lib/avatar'
import StageBadge from '@/components/common/StageBadge'
import EmptyState from '@/components/common/EmptyState'
import { useToast } from '@/components/common/Toast'
import { formatDate } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'
import type { Prospect } from '@/types'

function useViewMode() {
  const [view, setView] = useState<'liste' | 'calendrier'>(
    () => (localStorage.getItem('crm-relances-view') as 'liste' | 'calendrier') ?? 'liste'
  )
  const set = (v: 'liste' | 'calendrier') => {
    setView(v)
    localStorage.setItem('crm-relances-view', v)
  }
  return [view, set] as const
}

function RescheduleInline({
  prospect,
  onDone,
}: {
  prospect: Prospect
  onDone: () => void
}) {
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
    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-btn border border-border bg-card px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
      />
      <button
        onClick={save}
        disabled={!date}
        className="rounded-btn bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        OK
      </button>
      <button
        onClick={onDone}
        className="text-xs text-muted hover:text-text transition-colors"
      >
        Annuler
      </button>
    </div>
  )
}

function RelanceCard({
  prospect: p,
  badge,
  onContact,
  isContacting,
}: {
  prospect: Prospect
  badge: 'overdue' | 'today' | 'upcoming'
  onContact: () => void
  isContacting: boolean
}) {
  const navigate = useNavigate()
  const [rescheduling, setRescheduling] = useState(false)

  const badgeEl =
    badge === 'overdue' ? (
      <span className="text-[10px] font-bold text-crm-red bg-crm-red-light px-2 py-0.5 rounded-full">
        ⚠ En retard · {formatDate(p.next_followup_date)}
      </span>
    ) : badge === 'today' ? (
      <span className="text-[10px] font-bold text-crm-amber bg-crm-amber-light px-2 py-0.5 rounded-full">
        📅 Aujourd'hui
      </span>
    ) : (
      <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
        📅 {formatDate(p.next_followup_date)}
      </span>
    )

  return (
    <div
      className={cn(
        'rounded-card border bg-card p-4 transition-colors',
        badge === 'overdue' ? 'border-crm-red bg-crm-red-light/30' : 'border-border shadow-card'
      )}
    >
      <div className="flex items-start gap-3">
        <img
          src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
          alt=""
          width={44}
          height={44}
          className="rounded-full flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <button
              onClick={() => navigate(`/app/prospects/${p.id}`)}
              className="text-sm font-bold text-text hover:text-primary transition-colors"
            >
              {p.company_name}
            </button>
            <StageBadge stage={p.stage} />
            {badgeEl}
          </div>
          <p className="text-[11px] text-muted">
            {p.first_name} {p.last_name}
            {p.title ? ` · ${p.title}` : ''}
            {p.deal_value != null && (
              <span className="ml-1.5 font-bold text-crm-green">
                {p.deal_value.toLocaleString('fr-FR')} {p.currency}
              </span>
            )}
          </p>

          {rescheduling ? (
            <RescheduleInline prospect={p} onDone={() => setRescheduling(false)} />
          ) : (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onContact}
                disabled={isContacting}
                className="flex items-center gap-1.5 rounded-btn bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <CheckCheck size={11} />
                {isContacting ? 'Enregistrement…' : '✓ Fait'}
              </button>
              <button
                onClick={() => setRescheduling(true)}
                className="flex items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
              >
                <Calendar size={11} /> ⏰ Reporter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  color,
  children,
}: {
  title: string
  count: number
  color: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold" style={{ color }}>
          {title}
        </span>
        <span
          className="rounded-pill px-2 py-0.5 text-[10px] font-bold"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function CalendarView({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(null)
  const today = startOfDay(new Date())

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const getDay = (day: Date) =>
    prospects.filter(
      (p) => p.next_followup_date && isSameDay(parseISO(p.next_followup_date), day)
    )

  const getDotColor = (p: Prospect) => {
    if (!p.next_followup_date) return '#9ca3af'
    const d = parseISO(p.next_followup_date)
    if (isBefore(d, today)) return '#dc2626'
    if (isToday(d)) return '#d97706'
    return '#6366f1'
  }

  const selectedProspects = selected ? getDay(selected) : []

  const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="overflow-x-auto">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 rounded-card border border-border bg-card px-4 py-3 min-w-[320px]">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-btn text-muted hover:text-text hover:bg-bg transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-text capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-btn text-muted hover:text-text hover:bg-bg transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 mb-1 px-0.5 min-w-[320px]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5 min-w-[320px]">
        {days.map((day) => {
          const dayProspects = getDay(day)
          const inMonth = isSameMonth(day, month)
          const isTodayDay = isToday(day)
          const isSelected = selected != null && isSameDay(day, selected)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelected(isSelected ? null : day)}
              className={cn(
                'min-h-[52px] rounded-btn p-1.5 flex flex-col items-center gap-0.5 border transition-colors',
                inMonth ? 'text-text' : 'text-subtle',
                isTodayDay && 'border-primary bg-primary-light',
                isSelected && !isTodayDay && 'border-primary bg-primary-light',
                !isTodayDay && !isSelected && 'border-transparent hover:bg-bg'
              )}
            >
              <span
                className={cn(
                  'text-xs font-bold leading-none',
                  isTodayDay && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </span>
              {dayProspects.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
                  {dayProspects.slice(0, 3).map((p, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getDotColor(p) }}
                    />
                  ))}
                  {dayProspects.length > 3 && (
                    <span className="text-[8px] text-muted leading-none">
                      +{dayProspects.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day popover */}
      {selected && selectedProspects.length > 0 && (
        <div className="mt-4 rounded-card border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-bold text-text mb-3 capitalize">
            {format(selected, 'EEEE d MMMM', { locale: fr })}
          </p>
          <div className="flex flex-col gap-2">
            {selectedProspects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/app/prospects/${p.id}`)}
                className="flex items-center gap-3 p-2 rounded-btn hover:bg-bg transition-colors text-left"
              >
                <img
                  src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text truncate">{p.company_name}</p>
                  <p className="text-[10px] text-muted truncate">
                    {p.first_name} {p.last_name}
                  </p>
                </div>
                <StageBadge stage={p.stage} />
              </button>
            ))}
          </div>
        </div>
      )}
      {selected && selectedProspects.length === 0 && (
        <div className="mt-4 rounded-card border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted">Aucune relance ce jour.</p>
        </div>
      )}
    </div>
  )
}

export default function RelancesPage() {
  const { data: allProspects = [], isLoading } = useProspects()
  const createInteraction = useCreateInteraction()
  const update = useUpdateProspect()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [view, setView] = useViewMode()
  const [contactingId, setContactingId] = useState<string | null>(null)

  const today = startOfDay(new Date())
  const active = allProspects.filter(
    (p) => p.next_followup_date && p.stage !== 'Gagné' && p.stage !== 'Perdu'
  )
  const overdue = active.filter((p) =>
    isBefore(startOfDay(parseISO(p.next_followup_date!)), today)
  )
  const dueToday = active.filter((p) => isToday(parseISO(p.next_followup_date!)))
  const upcoming = active
    .filter((p) => isAfter(startOfDay(parseISO(p.next_followup_date!)), today))
    .sort((a, b) => (a.next_followup_date || '').localeCompare(b.next_followup_date || ''))

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
      qc.invalidateQueries({ queryKey: ['prospects'] })
      qc.invalidateQueries({ queryKey: ['relances'] })
      toast('Marqué comme contacté !')
    } finally {
      setContactingId(null)
    }
  }

  const totalPending = overdue.length + dueToday.length

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-card bg-border" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-text">Relances</h1>
          <p className="text-[13px] text-muted mt-0.5">
            {totalPending === 0 && upcoming.length === 0
              ? 'Aucune relance en attente — vous êtes à jour !'
              : totalPending > 0
              ? `${totalPending} relance${totalPending > 1 ? 's' : ''} à traiter`
              : `${upcoming.length} relance${upcoming.length > 1 ? 's' : ''} à venir`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-btn border border-border overflow-hidden flex-shrink-0">
          <button
            onClick={() => setView('liste')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors',
              view === 'liste' ? 'bg-primary text-white' : 'text-muted hover:text-text hover:bg-bg'
            )}
          >
            <List size={13} /> Liste
          </button>
          <button
            onClick={() => setView('calendrier')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors',
              view === 'calendrier'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-text hover:bg-bg'
            )}
          >
            <Calendar size={13} /> Calendrier
          </button>
        </div>
      </div>

      {view === 'liste' ? (
        <>
          {totalPending === 0 && upcoming.length === 0 && (
            <EmptyState
              icon={CheckCheck}
              title="Tout est à jour !"
              description="Aucune relance en retard ni prévue aujourd'hui."
            />
          )}

          {overdue.length > 0 && (
            <Section title="En retard" count={overdue.length} color="#dc2626">
              {overdue.map((p) => (
                <RelanceCard
                  key={p.id}
                  prospect={p}
                  badge="overdue"
                  onContact={() => handleMarkContacted(p)}
                  isContacting={contactingId === p.id}
                />
              ))}
            </Section>
          )}

          {dueToday.length > 0 && (
            <Section title="Aujourd'hui" count={dueToday.length} color="#d97706">
              {dueToday.map((p) => (
                <RelanceCard
                  key={p.id}
                  prospect={p}
                  badge="today"
                  onContact={() => handleMarkContacted(p)}
                  isContacting={contactingId === p.id}
                />
              ))}
            </Section>
          )}

          {upcoming.length > 0 && (
            <Section title="À venir" count={upcoming.length} color="#6366f1">
              {upcoming.slice(0, 10).map((p) => (
                <RelanceCard
                  key={p.id}
                  prospect={p}
                  badge="upcoming"
                  onContact={() => handleMarkContacted(p)}
                  isContacting={contactingId === p.id}
                />
              ))}
              {upcoming.length > 10 && (
                <p className="text-xs text-muted text-center py-2">
                  + {upcoming.length - 10} autres relances à venir
                </p>
              )}
            </Section>
          )}
        </>
      ) : (
        <CalendarView prospects={active} />
      )}
    </div>
  )
}
