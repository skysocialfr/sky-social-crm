import { PRIORITY_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { ProspectPriority } from '@/types'

interface Props {
  priority: ProspectPriority
  className?: string
}

export default function PriorityBadge({ priority, className }: Props) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', config.classes, className)}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
