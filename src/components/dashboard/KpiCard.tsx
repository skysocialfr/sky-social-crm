import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  description?: string
  alert?: boolean
}

export default function KpiCard({ title, value, icon: Icon, iconColor = 'text-primary', description, alert }: Props) {
  return (
    <div className={cn(
      'rounded-xl border bg-card p-5 flex items-start gap-4',
      alert ? 'border-red-700 bg-red-900/10' : 'border-border'
    )}>
      <div className={cn('rounded-lg p-2.5', alert ? 'bg-red-900/30' : 'bg-muted')}>
        <Icon size={18} className={alert ? 'text-red-400' : iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{title}</p>
        <p className={cn('text-2xl font-bold mt-0.5', alert ? 'text-red-300' : 'text-foreground')}>{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
