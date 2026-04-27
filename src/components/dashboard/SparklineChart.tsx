type Props = { data: number[]; color?: string }

export default function SparklineChart({ data, color = '#6366f1' }: Props) {
  const W = 70
  const H = 22
  if (data.length < 2) return <div style={{ width: W, height: H }} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * W,
    H - 2 - ((v - min) / range) * (H - 6),
  ])
  const linePoints = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const areaPoints = `0,${H} ${linePoints} ${W},${H}`
  const gradId = `sg${color.replace(/[^a-zA-Z0-9]/g, '')}`
  const last = pts[pts.length - 1]

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}
