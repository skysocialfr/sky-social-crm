import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DashboardStats } from '@/types'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981']

interface Props {
  byChannel: DashboardStats['byChannel']
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} prospect{payload[0].value > 1 ? 's' : ''}</p>
    </div>
  )
}

export default function ChannelChart({ byChannel }: Props) {
  if (byChannel.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Pas encore de données
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={byChannel}
          dataKey="count"
          nameKey="channel"
          cx="50%"
          cy="45%"
          outerRadius={75}
          innerRadius={40}
          paddingAngle={3}
        >
          {byChannel.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{value}</span>}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
