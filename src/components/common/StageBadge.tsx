import { STAGE_COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { PipelineStage } from '@/types'

interface Props {
  stage: PipelineStage
  className?: string
}

export default function StageBadge({ stage, className }: Props) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', STAGE_COLORS[stage], className)}>
      {stage}
    </span>
  )
}
