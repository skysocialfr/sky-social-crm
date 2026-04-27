import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import StageBadge from '@/components/common/StageBadge'
import ChannelIcon from '@/components/common/ChannelIcon'
import EmptyState from '@/components/common/EmptyState'
import { Users } from 'lucide-react'
import { dicebearAvatar } from '@/lib/avatar'
import { formatDate, isOverdue } from '@/lib/dateUtils'
import { PIPELINE_STAGES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { Prospect, PipelineStage } from '@/types'

type SortKey = 'company_name' | 'stage' | 'priority' | 'deal_value' | 'next_followup_date' | 'created_at'

interface Props {
  prospects: Prospect[]
  onEdit: (p: Prospect) => void
  onDelete: (p: Prospect) => void
}

const PRIORITY_ORDER: Record<string, number> = { Chaud: 0, Tiède: 1, Froid: 2 }
const ACTIVE_STAGES = PIPELINE_STAGES.filter((s) => s !== 'Perdu')
function stageScore(stage: PipelineStage): number {
  if (stage === 'Perdu') return 0
  const idx = ACTIVE_STAGES.indexOf(stage)
  return idx >= 0 ? Math.round(((idx + 1) / ACTIVE_STAGES.length) * 100) : 0
}

function ScoreBar({ stage }: { stage: PipelineStage }) {
  const score = stageScore(stage)
  const color =
    stage === 'Gagné'
      ? '#16a34a'
      : stage === 'Perdu'
      ? '#dc2626'
      : score >= 70
      ? '#7c3aed'
      : score >= 40
      ? '#d97706'
      : '#6366f1'
  return (
    <div className="flex items-center gap-1.5 min-w-[60px]">
      <div className="flex-1 h-1.5 rounded-full bg-border">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-semibold text-muted w-7 text-right">{score}%</span>
    </div>
  )
}

export default function ProspectsTable({ prospects, onEdit, onDelete }: Props) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...prospects].sort((a, b) => {
    let va: string | number = (a as any)[sortKey] ?? ''
    let vb: string | number = (b as any)[sortKey] ?? ''
    if (sortKey === 'priority') {
      va = PRIORITY_ORDER[a.priority] ?? 99
      vb = PRIORITY_ORDER[b.priority] ?? 99
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    }
    if (sortKey === 'deal_value') {
      va = a.deal_value ?? -1
      vb = b.deal_value ?? -1
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
    }
    const cmp = String(va).localeCompare(String(vb), 'fr')
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={11} className="opacity-25" />
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  function Th({
    children,
    sortable,
    k,
    className,
  }: {
    children: React.ReactNode
    sortable?: boolean
    k?: SortKey
    className?: string
  }) {
    return (
      <th
        onClick={sortable && k ? () => toggleSort(k) : undefined}
        className={cn(
          'px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted',
          sortable && 'cursor-pointer select-none hover:text-text',
          className
        )}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          {sortable && k && <SortIcon k={k} />}
        </span>
      </th>
    )
  }

  if (prospects.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun prospect"
        description="Ajoutez votre premier prospect avec le bouton ci-dessus."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border shadow-card bg-card">
      <table className="w-full min-w-[900px]">
        <thead className="border-b border-border bg-bg">
          <tr>
            <Th sortable k="company_name">Entreprise</Th>
            <Th sortable k="stage">Étape</Th>
            <Th sortable k="priority">Priorité</Th>
            <Th>Canal</Th>
            <Th sortable k="deal_value">Valeur</Th>
            <Th>Score</Th>
            <Th sortable k="next_followup_date">Prochain contact</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((p) => (
            <tr
              key={p.id}
              onClick={() => navigate(`/app/prospects/${p.id}`)}
              className="cursor-pointer hover:bg-bg transition-colors group"
            >
              {/* Entreprise + contact */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text truncate leading-tight">
                      {p.company_name}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {p.first_name} {p.last_name}
                      {p.sector ? ` · ${p.sector}` : ''}
                    </p>
                  </div>
                </div>
              </td>

              {/* Étape */}
              <td className="px-3 py-3">
                <StageBadge stage={p.stage} />
              </td>

              {/* Priorité */}
              <td className="px-3 py-3">
                <span className="text-sm">
                  {p.priority === 'Chaud' ? '🔥' : p.priority === 'Tiède' ? '🟡' : '❄️'}
                  {' '}
                  <span className="text-xs text-muted">{p.priority}</span>
                </span>
              </td>

              {/* Canal */}
              <td className="px-3 py-3">
                <ChannelIcon channel={p.channel} showLabel />
              </td>

              {/* Valeur */}
              <td className="px-3 py-3">
                {p.deal_value != null ? (
                  <span className="text-sm font-bold text-text whitespace-nowrap">
                    {p.deal_value.toLocaleString('fr-FR')} {p.currency}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>

              {/* Score */}
              <td className="px-3 py-3 min-w-[90px]">
                <ScoreBar stage={p.stage} />
              </td>

              {/* Prochain contact */}
              <td className="px-3 py-3">
                {p.next_followup_date ? (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isOverdue(p.next_followup_date) ? 'text-crm-red' : 'text-text'
                    )}
                  >
                    {isOverdue(p.next_followup_date) && '⚠ '}
                    {formatDate(p.next_followup_date)}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="relative inline-block">
                  <button
                    onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                    className="rounded-btn p-1.5 text-muted hover:text-text hover:bg-bg transition-colors"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {openMenu === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-card border border-border bg-card shadow-modal">
                        <button
                          onClick={() => { onEdit(p); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-text hover:bg-bg transition-colors rounded-t-card"
                        >
                          <Pencil size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => { onDelete(p); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-crm-red hover:bg-crm-red-light transition-colors rounded-b-card"
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
