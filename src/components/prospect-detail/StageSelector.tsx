import { Check } from 'lucide-react'
import { PIPELINE_STAGES, STAGE_DOT_COLORS } from '@/lib/constants'
import { useUpdateProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/cn'
import type { PipelineStage } from '@/types'

interface Props {
  prospectId: string
  currentStage: PipelineStage
}

export default function StageSelector({ prospectId, currentStage }: Props) {
  const update = useUpdateProspect()
  const { toast } = useToast()

  const currentIndex = PIPELINE_STAGES.indexOf(currentStage)

  const move = (stage: PipelineStage) => {
    if (stage === currentStage) return
    update.mutate(
      { id: prospectId, data: { stage } },
      { onSuccess: () => toast(`Étape : ${stage}`) }
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pipeline</p>
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map((stage, i) => {
          const isActive = stage === currentStage
          const isPast = i < currentIndex
          const color = STAGE_DOT_COLORS[stage]
          return (
            <button
              key={stage}
              onClick={() => move(stage)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'border-current text-white shadow-sm'
                  : isPast
                  ? 'border-border text-muted-foreground/60 hover:border-primary/40 hover:text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
            >
              {isActive && <Check size={10} strokeWidth={3} />}
              {stage}
            </button>
          )
        })}
      </div>
    </div>
  )
}
