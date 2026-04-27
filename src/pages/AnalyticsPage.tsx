import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { TrendingUp, Award, Clock, DollarSign } from 'lucide-react'

const FUNNEL_COLORS = [
  'bg-primary',
  'bg-crm-violet',
  'bg-crm-blue',
  'bg-crm-green',
  'bg-crm-amber',
]

function fmtEuro(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k€`
  return `${n}€`
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-card border border-border bg-card shadow-card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">{label}</p>
        <p className="text-2xl font-black text-text leading-none">{value}</p>
        {sub && <p className="text-[11px] text-subtle mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl animate-pulse">
        <div className="h-8 w-48 rounded bg-border" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-card bg-border" />)}
        </div>
        {[1, 2].map((i) => <div key={i} className="h-64 rounded-card bg-border" />)}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-5 max-w-5xl">
        <div>
          <h1 className="text-xl font-black text-text">Analytics</h1>
          <p className="text-[13px] text-muted mt-0.5">Ajoutez des prospects pour voir vos statistiques.</p>
        </div>
        <div className="rounded-card border-2 border-dashed border-border p-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm font-bold text-text mb-1">Aucune donnée</p>
          <p className="text-xs text-muted">Commencez à ajouter des prospects pour voir vos analytics.</p>
        </div>
      </div>
    )
  }

  const revenueChartData = data.revenueMonths.map((m, i) => ({
    month: m,
    revenue: data.revenueByMonth[i],
  }))

  const conversionChartData = data.revenueMonths.map((m, i) => ({
    month: m,
    rate: data.conversionByMonth[i],
  }))

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-text">Analytics</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Performances commerciales · {data.totalWon} deals gagnés · {data.totalLost} perdus
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={<Clock size={18} className="text-crm-violet" />}
          label="Cycle moyen"
          value={data.avgCycleDays > 0 ? `${data.avgCycleDays}j` : '—'}
          sub="de la création au closing"
          color="bg-crm-violet-light"
        />
        <KpiCard
          icon={<DollarSign size={18} className="text-crm-green" />}
          label="Valeur moyenne deal"
          value={data.avgDealValue > 0 ? fmtEuro(data.avgDealValue) : '—'}
          sub="deals gagnés avec valeur"
          color="bg-crm-green-light"
        />
        <KpiCard
          icon={<Award size={18} className="text-crm-amber" />}
          label="Top canal"
          value={data.topChannel}
          sub={data.topChannelRate > 0 ? `${data.topChannelRate}% de conversion` : 'aucune conversion'}
          color="bg-crm-amber-light"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue chart */}
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-primary" />
            <h2 className="text-sm font-bold text-text">Revenus mensuels</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7f8" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : String(v)}
                width={36}
              />
              <Tooltip
                formatter={(v: number) => [fmtEuro(v), 'Revenus']}
                contentStyle={{
                  borderRadius: 9,
                  border: '1px solid #e4e7f8',
                  fontSize: 12,
                  boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion rate chart */}
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-crm-green" />
            <h2 className="text-sm font-bold text-text">Taux de conversion par cohorte</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversionChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7f8" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={36}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Conversion']}
                contentStyle={{
                  borderRadius: 9,
                  border: '1px solid #e4e7f8',
                  fontSize: 12,
                  boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#16a34a' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel + Channel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <h2 className="text-sm font-bold text-text mb-4">Entonnoir de conversion</h2>
          <div className="flex flex-col gap-3">
            {data.funnelData.map((step, idx) => (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text">{step.stage}</span>
                  <span className="text-xs text-muted">{step.count} · {step.pct}%</span>
                </div>
                <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${FUNNEL_COLORS[idx % FUNNEL_COLORS.length]}`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="rounded-card border border-border bg-card shadow-card p-5">
          <h2 className="text-sm font-bold text-text mb-4">Performance par canal</h2>
          {data.channelBreakdown.length === 0 ? (
            <p className="text-xs text-muted">Aucune donnée de canal disponible.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Canal</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted text-right">Total</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted text-right">Gagnés</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted text-right">Taux</span>
              </div>
              {data.channelBreakdown.map((c) => (
                <div key={c.channel} className="grid grid-cols-4 gap-2 py-2 border-t border-border">
                  <span className="text-xs font-medium text-text truncate">{c.channel}</span>
                  <span className="text-xs text-muted text-right">{c.total}</span>
                  <span className="text-xs text-crm-green text-right font-medium">{c.won}</span>
                  <span className={`text-xs font-bold text-right ${c.rate >= 50 ? 'text-crm-green' : c.rate >= 25 ? 'text-crm-amber' : 'text-muted'}`}>
                    {c.rate}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Deals gagnés', value: data.totalWon, color: 'text-crm-green' },
          { label: 'Deals perdus', value: data.totalLost, color: 'text-crm-red' },
          { label: 'Canaux actifs', value: data.channelBreakdown.length, color: 'text-primary' },
          { label: 'Étapes funnel', value: data.funnelData.length, color: 'text-crm-violet' },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-border bg-card shadow-card p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
