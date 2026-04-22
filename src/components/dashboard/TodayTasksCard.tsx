import { useNavigate } from 'react-router-dom'
import { parseISO, isBefore, isToday, startOfDay } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import type { Prospect } from '@/types'

export default function TodayTasksCard({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()
  const today = startOfDay(new Date())
  const tasks = prospects
    .filter(p => p.next_followup_date && p.stage !== 'Gagné' && p.stage !== 'Perdu')
    .map(p => {
      const date = parseISO(p.next_followup_date!)
      const overdue = isBefore(startOfDay(date), today)
      const isT = isToday(date)
      return { p, overdue, isT }
    })
    .filter(t => t.overdue || t.isT)
    .sort((a, b) => (a.p.next_followup_date || '').localeCompare(b.p.next_followup_date || ''))
    .slice(0, 4)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-foreground">📅 À faire aujourd'hui</p>
          <p className="text-xs text-muted-foreground mt-0.5">Relances programmées et en retard</p>
        </div>
        <button
          onClick={() => navigate('/app/relances')}
          className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
        >
          Tout <ArrowRight size={11} />
        </button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Aucune relance à faire 🎉</p>
      ) : (
        <div className="flex flex-col">
          {tasks.map((t, i) => (
            <button
              key={t.p.id}
              onClick={() => navigate(`/app/prospects/${t.p.id}`)}
              className={`flex items-center gap-3 py-2.5 px-2 hover:bg-muted/50 rounded-lg text-left ${
                i < tasks.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <input
                type="checkbox"
                onClick={e => e.stopPropagation()}
                className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
              />
              <Avatar firstName={t.p.first_name} lastName={t.p.last_name} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {t.p.first_name} {t.p.last_name}
                  <span className="font-medium text-muted-foreground"> · {t.p.company_name}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Relance · {t.p.stage}</p>
              </div>
              {t.overdue ? (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 rounded flex-shrink-0">
                  En retard
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded flex-shrink-0">
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
