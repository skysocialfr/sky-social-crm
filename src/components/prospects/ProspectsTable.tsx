import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import PriorityBadge from '@/components/common/PriorityBadge'
import StageBadge from '@/components/common/StageBadge'
import ChannelIcon from '@/components/common/ChannelIcon'
import EmptyState from '@/components/common/EmptyState'
import { Users } from 'lucide-react'
import { formatDate, isOverdue } from '@/lib/dateUtils'
import { cn } from '@/lib/cn'
import type { Prospect } from '@/types'

type SortKey = 'company_name' | 'stage' | 'priority' | 'deal_value' | 'next_followup_date' | 'created_at'

interface Props {
  prospects: Prospect[]
  onEdit: (p: Prospect) => void
  onDelete: (p: Prospect) => void
}

export default function ProspectsTable({ prospects, onEdit, onDelete }: Props) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...prospects].sort((a, b) => {
    const va = a[sortKey] ?? ''
    const vb = b[sortKey] ?? ''
    const cmp = String(va).localeCompare(String(vb), 'fr')
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  function Th({ children, sortable, k }: { children: React.ReactNode; sortable?: boolean; k?: SortKey }) {
    return (
      <th
        onClick={sortable && k ? () => toggleSort(k) : undefined}
        className={cn(
          'px-4 py-3 text-left text-xs font-medium text-muted-foreground',
          sortable && 'cursor-pointer select-none hover:text-foreground'
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
    return <EmptyState icon={Users} title="Aucun prospect" description="Ajoutez votre premier prospect avec le bouton ci-dessus." />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px]">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            <Th sortable k="priority">Priorité</Th>
            <Th sortable k="company_name">Entreprise</Th>
            <Th>Contact</Th>
            <Th sortable k="stage">Étape</Th>
            <Th>Canal</Th>
            <Th sortable k="deal_value">Valeur</Th>
            <Th sortable k="next_followup_date">Prochain contact</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((p) => (
            <tr
              key={p.id}
              onClick={() => navigate(`/prospects/${p.id}`)}
              className="cursor-pointer hover:bg-muted/20 transition-colors"
            >
              <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
              <td className="px-4 py-3">
                <p className="font-medium text-sm text-foreground">{p.company_name}</p>
                {p.sector && <p className="text-xs text-muted-foreground">{p.sector}</p>}
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-foreground">{p.first_name} {p.last_name}</p>
                {p.title && <p className="text-xs text-muted-foreground">{p.title}</p>}
              </td>
              <td className="px-4 py-3"><StageBadge stage={p.stage} /></td>
              <td className="px-4 py-3"><ChannelIcon channel={p.channel} showLabel /></td>
              <td className="px-4 py-3">
                {p.deal_value ? (
                  <span className="text-sm font-medium text-foreground">
                    {p.deal_value.toLocaleString('fr-FR')} {p.currency}
                  </span>
                ) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3">
                {p.next_followup_date ? (
                  <span className={cn('text-xs', isOverdue(p.next_followup_date) ? 'text-red-400 font-medium' : 'text-foreground')}>
                    {isOverdue(p.next_followup_date) && '⚠ '}
                    {formatDate(p.next_followup_date)}
                  </span>
                ) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  {openMenu === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-border bg-card shadow-xl">
                        <button
                          onClick={() => { onEdit(p); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors rounded-t-lg"
                        >
                          <Pencil size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => { onDelete(p); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-muted transition-colors rounded-b-lg"
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
