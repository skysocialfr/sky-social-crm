import { useNavigate } from 'react-router-dom'
import { parseISO, isBefore, isToday, startOfDay } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { dicebearAvatar } from '@/lib/avatar'
import type { Prospect } from '@/types'

export default function TodayTasksCard({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()
  const today = startOfDay(new Date())
  const tasks = prospects
    .filter((p) => p.next_followup_date && p.stage !== 'Gagné' && p.stage !== 'Perdu')
    .map((p) => {
      const date = parseISO(p.next_followup_date!)
      const overdue = isBefore(startOfDay(date), today)
      const isT = isToday(date)
      return { p, overdue, isT }
    })
    .filter((t) => t.overdue || t.isT)
    .sort((a, b) => (a.p.next_followup_date || '').localeCompare(b.p.next_followup_date || ''))
    .slice(0, 5)

  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-text">📅 À faire aujourd'hui</p>
          <p className="text-[11px] text-muted mt-0.5">Relances programmées et en retard</p>
        </div>
        <button
          onClick={() => navigate('/app/relances')}
          className="flex items-center gap-1 rounded-btn bg-primary-light border border-primary-border px-2.5 py-1 text-[11px] font-bold text-primary hover:opacity-80 transition-opacity"
        >
          Tout <ArrowRight size={11} />
        </button>
      </div>
      {tasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted text-center py-6">Aucune relance à faire 🎉</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {tasks.map((t, i) => (
            <button
              key={t.p.id}
              onClick={() => navigate(`/app/prospects/${t.p.id}`)}
              className={`flex items-center gap-3 py-2.5 px-2 hover:bg-bg rounded-btn text-left ${
                i < tasks.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
              />
              <img
                src={dicebearAvatar(`${t.p.first_name} ${t.p.last_name}`)}
                alt=""
                width={28}
                height={28}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text truncate">
                  {t.p.first_name} {t.p.last_name}
                  <span className="font-medium text-muted"> · {t.p.company_name}</span>
                </p>
                <p className="text-[11px] text-muted mt-0.5">Relance · {t.p.stage}</p>
              </div>
              {t.overdue ? (
                <span className="text-[10px] font-bold text-crm-red bg-crm-red-light px-1.5 py-0.5 rounded-full flex-shrink-0">
                  En retard
                </span>
              ) : (
                <span className="text-[10px] font-bold text-crm-amber bg-crm-amber-light px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Aujourd'hui
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
