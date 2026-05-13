import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dicebearAvatar } from '@/lib/avatar'
import { useProspects } from '@/hooks/useProspects'
import { useTeamMembers } from '@/hooks/useTeam'
import type { Prospect, TeamMember } from '@/types'

const MEDALS = ['🥇', '🥈', '🥉', '']

export default function TeamCard() {
  const { data: prospects = [] } = useProspects()
  const { data: members = [] } = useTeamMembers()

  // Fewer than 2 members → leaderboard would be a 1-row leaderboard. Switch
  // to a "Closing this month" view instead, which is useful for solo too.
  if (members.length < 2) {
    return <ClosingPipelineCard prospects={prospects} />
  }
  return <TeamRankingCard prospects={prospects} members={members} />
}

// ============================================================
// Team ranking: deals won this month per member
// ============================================================

function TeamRankingCard({ prospects, members }: { prospects: Prospect[]; members: TeamMember[] }) {
  const navigate = useNavigate()

  const ranking = useMemo(() => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const startMs = startOfMonth.getTime()

    const wonByUser = new Map<string, { count: number; revenue: number }>()
    for (const p of prospects) {
      if (p.stage !== 'Gagné') continue
      if (new Date(p.updated_at).getTime() < startMs) continue
      const owner = p.assigned_to ?? p.user_id
      const cur = wonByUser.get(owner) ?? { count: 0, revenue: 0 }
      wonByUser.set(owner, {
        count: cur.count + 1,
        revenue: cur.revenue + (p.deal_value ?? 0),
      })
    }

    const rows = members.map((m) => {
      const stats = wonByUser.get(m.user_id) ?? { count: 0, revenue: 0 }
      return {
        userId: m.user_id,
        name: m.display_name?.trim() || m.email || 'Membre',
        count: stats.count,
        revenue: stats.revenue,
      }
    })
    rows.sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    return rows
  }, [prospects, members])

  const max = Math.max(1, ranking[0]?.count ?? 0)
  const allZero = ranking.every((r) => r.count === 0)

  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-text">🏆 Classement équipe</p>
          <p className="text-[11px] text-muted mt-0.5">Deals gagnés ce mois-ci</p>
        </div>
      </div>
      {allZero ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted text-center py-6">
            Aucun deal gagné ce mois-ci. Marquez un prospect en « Gagné » pour démarrer le classement.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {ranking.slice(0, 4).map((r, i) => (
            <button
              key={r.userId}
              onClick={() => navigate(`/app/prospects?assigned_to=${r.userId}`)}
              className="flex items-center gap-2.5 text-left rounded-btn p-1 -m-1 hover:bg-bg transition-colors"
            >
              <span className="text-sm w-5 flex-shrink-0 text-center">{MEDALS[i]}</span>
              <img
                src={dicebearAvatar(r.name)}
                alt=""
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text truncate">{r.name}</span>
                  <span className="text-[11px] font-bold text-primary ml-1">{r.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${(r.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Solo fallback: top deals in closing-stage by value
// ============================================================

function ClosingPipelineCard({ prospects }: { prospects: Prospect[] }) {
  const navigate = useNavigate()

  const top = useMemo(() => {
    return prospects
      .filter((p) => p.stage === 'Devis envoyé' || p.stage === 'En négociation' || p.stage === 'RDV fixé')
      .sort((a, b) => (b.deal_value ?? 0) - (a.deal_value ?? 0))
      .slice(0, 4)
  }, [prospects])

  const max = Math.max(1, top[0]?.deal_value ?? 0)

  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-text">🎯 À closer en priorité</p>
          <p className="text-[11px] text-muted mt-0.5">Top deals en pipeline avancé</p>
        </div>
      </div>
      {top.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted text-center py-6">
            Aucun deal en phase finale. Avancez vos prospects vers « RDV fixé » ou « Devis envoyé ».
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {top.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/app/prospects/${p.id}`)}
              className="flex items-center gap-2.5 text-left rounded-btn p-1 -m-1 hover:bg-bg transition-colors"
            >
              <img
                src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
                alt=""
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text truncate">{p.company_name}</span>
                  <span className="text-[11px] font-bold text-primary ml-1 whitespace-nowrap">
                    {(p.deal_value ?? 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${((p.deal_value ?? 0) / max) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
