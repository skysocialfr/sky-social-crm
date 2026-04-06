import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { STAGE_DOT_COLORS } from '@/lib/constants'
import type { DashboardStats, PipelineStage } from '@/types'

interface Props {
  byStage: DashboardStats['byStage']
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{d.stage}</p>
      <p className="text-muted-foreground">{d.count} prospect{d.count > 1 ? 's' : ''}</p>
      {d.value > 0 && <p className="text-emerald-400">{d.value.toLocaleString('fr-FR')} €</p>}
    </div>
  )
}

export default function FunnelChart({ byStage }: Props) {
  const data = byStage.filter(d => d.count > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Pas encore de données
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={byStage} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={120}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {byStage.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_DOT_COLORS[entry.stage as PipelineStage]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
