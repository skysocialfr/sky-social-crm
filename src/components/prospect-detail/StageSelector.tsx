import { Check } from 'lucide-react'
import { useActivePipeline } from '@/hooks/usePipelines'
import { useUpdateProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/cn'

interface Props {
  prospectId: string
  currentStage: string
  pipelineId: string
}

export default function StageSelector({ prospectId, currentStage, pipelineId }: Props) {
  const { stages } = useActivePipeline(pipelineId)
  const update = useUpdateProspect()
  const { toast } = useToast()

  const currentIndex = stages.findIndex(s => s.label === currentStage)

  const move = (stage: string) => {
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
        {stages.map((stage, i) => {
          const isActive = stage.label === currentStage
          const isPast = i < currentIndex
          return (
            <button
              key={stage.label}
              onClick={() => move(stage.label)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'border-current text-white shadow-sm'
                  : isPast
                  ? 'border-border text-muted-foreground/60 hover:border-primary/40 hover:text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
              style={isActive ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
            >
              {isActive && <Check size={10} strokeWidth={3} />}
              {stage.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
