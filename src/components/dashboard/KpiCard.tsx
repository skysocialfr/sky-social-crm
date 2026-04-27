import SparklineChart from './SparklineChart'

interface Props {
  title: string
  value: string | number
  color?: string
  sparkData?: number[]
  trend?: number
  description?: string
}

export default function KpiCard({
  title,
  value,
  color = '#6366f1',
  sparkData,
  trend,
  description,
}: Props) {
  const up = (trend ?? 0) >= 0
  return (
    <div className="rounded-card shadow-card border border-border bg-card p-4 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted leading-none">
          {title}
        </p>
        <p className="text-[28px] font-black text-text leading-none">{value}</p>
        {trend !== undefined ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full w-fit ${
              up
                ? 'text-crm-green bg-crm-green-light'
                : 'text-crm-red bg-crm-red-light'
            }`}
          >
            {up ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        ) : description ? (
          <p className="text-[11px] text-muted">{description}</p>
        ) : null}
      </div>
      {sparkData && sparkData.length >= 2 && (
        <div className="flex-shrink-0 mt-1">
          <SparklineChart data={sparkData} color={color} />
        </div>
      )}
    </div>
  )
}
