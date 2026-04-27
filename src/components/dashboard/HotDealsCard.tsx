import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { dicebearAvatar } from '@/lib/avatar'
import type { Prospect } from '@/types'

export default function HotDealsCard({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()
  const hot = prospects
    .filter((p) => p.priority === 'Chaud' && p.stage !== 'Gagné' && p.stage !== 'Perdu')
    .sort((a, b) => (b.deal_value ?? 0) - (a.deal_value ?? 0))
    .slice(0, 4)

  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-text">🔥 Deals chauds à closer</p>
          <p className="text-[11px] text-muted mt-0.5">
            {hot.length} plus gros en pipeline
          </p>
        </div>
        <button
          onClick={() => navigate('/app/prospects')}
          className="flex items-center gap-1 rounded-btn bg-primary-light border border-primary-border px-2.5 py-1 text-[11px] font-bold text-primary hover:opacity-80 transition-opacity"
        >
          Tous <ArrowRight size={11} />
        </button>
      </div>
      {hot.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted text-center py-6">Aucun deal chaud pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 flex-1">
          {hot.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/app/prospects/${p.id}`)}
              className="flex items-center gap-3 rounded-btn p-2.5 hover:bg-bg transition-colors text-left w-full border border-transparent hover:border-border"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm text-[9px] ring-1 ring-white">
                  🔥
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-bold text-text truncate">
                    {p.first_name} {p.last_name}
                  </span>
                  <span className="text-[11px] text-muted truncate">· {p.company_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span>{p.stage}</span>
                  <span>·</span>
                  <span>{p.channel.split('/')[0]}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-text whitespace-nowrap">
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
