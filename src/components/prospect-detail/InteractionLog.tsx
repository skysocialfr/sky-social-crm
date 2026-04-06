import { Trash2, Phone, Mail, Linkedin, Instagram, Users, FileText, MessageSquare } from 'lucide-react'
import { useInteractions, useDeleteInteraction } from '@/hooks/useInteractions'
import { formatDateTime, formatRelative } from '@/lib/dateUtils'
import { useToast } from '@/components/common/Toast'
import EmptyState from '@/components/common/EmptyState'
import { cn } from '@/lib/cn'
import type { InteractionType } from '@/types'

const TYPE_CONFIG: Record<InteractionType, { Icon: React.ElementType; color: string }> = {
  Appel: { Icon: Phone, color: 'text-green-400 bg-green-900/30' },
  Email: { Icon: Mail, color: 'text-violet-400 bg-violet-900/30' },
  LinkedIn: { Icon: Linkedin, color: 'text-blue-400 bg-blue-900/30' },
  Instagram: { Icon: Instagram, color: 'text-pink-400 bg-pink-900/30' },
  Réunion: { Icon: Users, color: 'text-amber-400 bg-amber-900/30' },
  Devis: { Icon: FileText, color: 'text-emerald-400 bg-emerald-900/30' },
  'Note interne': { Icon: MessageSquare, color: 'text-slate-400 bg-slate-800' },
}

interface Props {
  prospectId: string
}

export default function InteractionLog({ prospectId }: Props) {
  const { data: interactions = [], isLoading } = useInteractions(prospectId)
  const deleteInteraction = useDeleteInteraction()
  const { toast } = useToast()

  if (isLoading) return <div className="text-sm text-muted-foreground">Chargement…</div>

  if (interactions.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aucune interaction"
        description="Ajoutez votre première interaction avec ce prospect."
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction, i) => {
        const { Icon, color } = TYPE_CONFIG[interaction.type]
        return (
          <div key={interaction.id} className="flex gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', color)}>
                <Icon size={13} />
              </div>
              {i < interactions.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-foreground">{interaction.type}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground" title={formatDateTime(interaction.date)}>
                    {formatRelative(interaction.date)}
                  </span>
                </div>
                <button
                  onClick={() => deleteInteraction.mutate(
                    { id: interaction.id, prospectId },
                    { onSuccess: () => toast('Interaction supprimée') }
                  )}
                  className="rounded-md p-1 text-muted-foreground hover:text-red-400 hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              <p className="mt-1 text-sm text-foreground">{interaction.summary}</p>
              {interaction.outcome && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">Résultat : </span>
                  {interaction.outcome}
                </p>
              )}
              {interaction.next_action && (
                <p className="mt-1 text-xs text-primary">
                  <span className="font-medium">Prochaine action : </span>
                  {interaction.next_action}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
