import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Avatar from '@/components/common/Avatar'
import type { Prospect } from '@/types'

export default function HotDealsCard({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()
  const hot = prospects
    .filter(p => p.priority === 'Chaud' && p.stage !== 'Gagné' && p.stage !== 'Perdu')
    .sort((a, b) => (b.deal_value ?? 0) - (a.deal_value ?? 0))
    .slice(0, 4)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-foreground">🔥 Deals chauds à closer</p>
          <p className="text-xs text-muted-foreground mt-0.5">Les {hot.length} plus gros en pipeline</p>
        </div>
        <button
          onClick={() => navigate('/app/prospects')}
          className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
        >
          Tous <ArrowRight size={11} />
        </button>
      </div>
      {hot.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Aucun deal chaud pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {hot.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/app/prospects/${p.id}`)}
              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors text-left w-full border border-transparent hover:border-border"
            >
              <div className="relative flex-shrink-0">
                <Avatar firstName={p.first_name} lastName={p.last_name} size={40} />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm text-[9px] ring-1 ring-white">🔥</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-bold text-foreground truncate">{p.first_name} {p.last_name}</span>
                  <span className="text-xs text-muted-foreground truncate">· {p.company_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{p.stage}</span>
                  <span>·</span>
                  <span>{p.channel.split('/')[0]}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-foreground whitespace-nowrap">
                  {(p.deal_value ?? 0).toLocaleString('fr-FR')} €
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
