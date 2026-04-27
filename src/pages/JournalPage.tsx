import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import { parseISO, format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useJournal } from '@/hooks/useJournal'
import { useProspects } from '@/hooks/useProspects'
import { dicebearAvatar } from '@/lib/avatar'
import { INTERACTION_TYPES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { InteractionType } from '@/types'

const TYPE_CONFIG: Record<
  InteractionType,
  { emoji: string; color: string }
> = {
  Appel:          { emoji: '📞', color: 'text-crm-green bg-crm-green-light' },
  Email:          { emoji: '✉️', color: 'text-crm-violet bg-crm-violet-light' },
  LinkedIn:       { emoji: '💼', color: 'text-crm-blue bg-crm-blue-light' },
  Instagram:      { emoji: '📸', color: 'text-crm-pink bg-crm-pink-light' },
  Réunion:        { emoji: '🤝', color: 'text-crm-amber bg-crm-amber-light' },
  Devis:          { emoji: '📋', color: 'text-crm-green bg-crm-green-light' },
  'Note interne': { emoji: '📝', color: 'text-subtle bg-bg' },
}

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return "Aujourd'hui"
  if (isYesterday(d)) return 'Hier'
  return format(d, 'EEEE d MMMM yyyy', { locale: fr })
}

export default function JournalPage() {
  const navigate = useNavigate()
  const { data: entries = [], isLoading } = useJournal()
  const { data: prospects = [] } = useProspects()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<InteractionType | ''>('')
  const [prospectFilter, setProspectFilter] = useState<string>('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false
      if (prospectFilter && e.prospect_id !== prospectFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = `${e.prospect_name} ${e.company_name}`.toLowerCase()
        if (!e.summary.toLowerCase().includes(q) && !name.includes(q)) return false
      }
      return true
    })
  }, [entries, typeFilter, prospectFilter, search])

  // Group by date (YYYY-MM-DD from the `date` field)
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const e of filtered) {
      const day = e.date.slice(0, 10)
      if (!map[day]) map[day] = []
      map[day].push(e)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const hasFilters = search || typeFilter || prospectFilter
  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setProspectFilter('')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 max-w-3xl animate-pulse">
        <div className="h-14 rounded-card bg-border" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-card bg-border" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-text">Journal d'activité</h1>
        <p className="text-[13px] text-muted mt-0.5">
          {filtered.length} interaction{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== entries.length && ` sur ${entries.length}`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-btn border border-border bg-card pl-8 pr-3 py-2 text-xs text-text placeholder:text-subtle focus:border-primary focus:outline-none w-48"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as InteractionType | '')}
          className="rounded-btn border border-border bg-card px-3 py-2 text-xs text-text focus:border-primary focus:outline-none"
        >
          <option value="">Tous les types</option>
          {INTERACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_CONFIG[t]?.emoji} {t}
            </option>
          ))}
        </select>

        <select
          value={prospectFilter}
          onChange={(e) => setProspectFilter(e.target.value)}
          className="rounded-btn border border-border bg-card px-3 py-2 text-xs text-text focus:border-primary focus:outline-none max-w-[180px]"
        >
          <option value="">Tous les prospects</option>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-btn border border-border px-3 py-2 text-xs text-muted hover:text-text hover:bg-bg transition-colors"
          >
            <X size={11} /> Effacer
          </button>
        )}
      </div>

      {/* Entries */}
      {grouped.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-border p-12 text-center">
          <p className="text-3xl mb-3">📓</p>
          <p className="text-sm font-bold text-text mb-1">Aucune interaction</p>
          <p className="text-xs text-muted">
            {hasFilters
              ? 'Aucun résultat pour ces filtres.'
              : 'Commencez à enregistrer vos interactions depuis les fiches prospects.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([day, dayEntries]) => (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-muted capitalize">
                  {dayLabel(day + 'T00:00:00')}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-subtle rounded-pill bg-bg border border-border px-2 py-0.5">
                  {dayEntries.length}
                </span>
              </div>

              {/* Day entries */}
              <div className="flex flex-col gap-2">
                {dayEntries.map((entry) => {
                  const cfg = TYPE_CONFIG[entry.type]
                  const isOpen = expanded.has(entry.id)
                  const hasDetails = entry.outcome || entry.next_action

                  return (
                    <div
                      key={entry.id}
                      className="rounded-card shadow-card border border-border bg-card overflow-hidden"
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Avatar + type badge */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={dicebearAvatar(entry.prospect_name || entry.company_name)}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <span
                            className={cn(
                              'absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm text-[9px] ring-1 ring-white'
                            )}
                          >
                            {cfg?.emoji ?? '📌'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-pill',
                                  cfg?.color ?? 'text-muted bg-bg'
                                )}
                              >
                                {entry.type}
                              </span>
                              <button
                                onClick={() => navigate(`/app/prospects/${entry.prospect_id}`)}
                                className="text-xs font-bold text-text hover:text-primary transition-colors"
                              >
                                {entry.prospect_name || entry.company_name}
                              </button>
                              {entry.prospect_name && entry.company_name && (
                                <span className="text-[10px] text-subtle truncate">
                                  · {entry.company_name}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-subtle flex-shrink-0">
                              {format(parseISO(entry.date), 'HH:mm', { locale: fr })}
                            </span>
                          </div>

                          <p className="text-sm text-text leading-relaxed">{entry.summary}</p>

                          {hasDetails && (
                            <button
                              onClick={() => toggleExpand(entry.id)}
                              className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                              {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              {isOpen ? 'Réduire' : 'Voir le détail'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isOpen && hasDetails && (
                        <div className="border-t border-border bg-bg px-4 py-3 flex flex-col gap-2">
                          {entry.outcome && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                Résultat
                              </span>
                              <p className="text-xs text-text mt-0.5">{entry.outcome}</p>
                            </div>
                          )}
                          {entry.next_action && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                Prochaine action
                              </span>
                              <p className="text-xs text-text mt-0.5">{entry.next_action}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
