import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {
  months: string[]
  won: number[]
  pipeline: number[]
}

export default function RevenueChart({ months, won, pipeline }: Props) {
  const data = months.map((m, i) => ({ m, won: won[i] ?? 0, pipeline: pipeline[i] ?? 0 }))

  return (
    <div className="h-full flex flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
        Revenus 7 mois
      </p>
      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={10} barGap={2} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="m"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: '1px solid #e4e7f8',
                padding: '6px 10px',
                boxShadow: 'none',
              }}
              cursor={{ fill: 'rgba(99,102,241,0.04)' }}
              formatter={(v: number) => [`${v.toLocaleString('fr-FR')} €`]}
            />
            <Bar
              dataKey="pipeline"
              stackId="a"
              fill="rgba(99,102,241,0.18)"
              radius={[0, 0, 4, 4]}
              name="Pipeline"
            />
            <Bar
              dataKey="won"
              stackId="a"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              name="Gagné"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
