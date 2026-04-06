import { Linkedin, Mail, Instagram, Phone } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ProspectingChannel } from '@/types'

interface Props {
  channel: ProspectingChannel
  className?: string
  showLabel?: boolean
}

const CONFIG: Record<ProspectingChannel, { Icon: React.ElementType; color: string }> = {
  'LinkedIn': { Icon: Linkedin, color: 'text-blue-400' },
  'Email froid': { Icon: Mail, color: 'text-violet-400' },
  'Instagram/DMs': { Icon: Instagram, color: 'text-pink-400' },
  'Téléphone/Physique': { Icon: Phone, color: 'text-green-400' },
}

export default function ChannelIcon({ channel, className, showLabel = false }: Props) {
  const { Icon, color } = CONFIG[channel]
  return (
    <span className={cn('inline-flex items-center gap-1', color, className)}>
      <Icon size={14} />
      {showLabel && <span className="text-xs">{channel}</span>}
    </span>
  )
}
