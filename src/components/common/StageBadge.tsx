import { useActivePipeline } from '@/hooks/usePipelines'
import { stageHex, stageTwClass, isLegacyStage } from '@/lib/stageColors'
import { cn } from '@/lib/cn'

interface Props {
  stage: string
  pipelineId?: string | null
  className?: string
}

// Renders a stage label as a coloured pill. Legacy stages get the
// curated Tailwind palette; custom stages get their hex tinted
// inline. The component reads the active pipeline so it can colour
// custom labels correctly without callers passing the full stages
// array everywhere.
export default function StageBadge({ stage, pipelineId, className }: Props) {
  const { stages } = useActivePipeline(pipelineId ?? null)

  if (isLegacyStage(stage)) {
    return (
      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', stageTwClass(stage), className)}>
        {stage}
      </span>
    )
  }

  const hex = stageHex(stages, stage)
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: `${hex}22`, color: hex }}
    >
      {stage}
    </span>
  )
}
