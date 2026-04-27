import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { dicebearAvatar } from '@/lib/avatar'
import { useRecentActivity } from '@/hooks/useRecentActivity'

const TYPE_EMOJI: Record<string, string> = {
  Appel: '📞',
  Email: '✉️',
  LinkedIn: '💼',
  Instagram: '📸',
  Réunion: '🤝',
  Devis: '📋',
  'Note interne': '📝',
}

export default function ActivityFeed() {
  const navigate = useNavigate()
  const { data: activities, isLoading } = useRecentActivity()

  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-text">⚡ Activité récente</p>
        <button
          onClick={() => navigate('/app/journal')}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Tout voir <ArrowRight size={10} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-btn bg-bg animate-pulse" />
          ))}
        </div>
      ) : !activities?.length ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-muted text-center">Aucune activité récente.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border flex-1">
          {activities.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/app/prospects/${a.prospect_id}`)}
              className="flex items-start gap-3 py-3 text-left hover:bg-bg rounded-btn px-1 -mx-1 transition-colors"
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <img
                  src={dicebearAvatar(a.prospect_name || a.company_name)}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm text-[9px] ring-1 ring-white">
                  {TYPE_EMOJI[a.type] ?? '📌'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-bold text-text truncate">{a.prospect_name}</span>
                  {a.company_name && (
                    <span className="text-[10px] text-subtle truncate">· {a.company_name}</span>
                  )}
                </div>
                <p className="text-[11px] text-muted truncate">{a.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                <span className="text-[10px] text-subtle whitespace-nowrap">
                  {formatDistanceToNow(parseISO(a.created_at), { addSuffix: true, locale: fr })}
                </span>
                {a.outcome && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-bg border border-border text-muted">
                    {a.outcome}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
