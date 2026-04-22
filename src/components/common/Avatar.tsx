interface Props {
  firstName: string
  lastName: string
  size?: number
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4',
  '#10b981', '#f59e0b', '#f97316', '#ec4899',
  '#a855f7', '#14b8a6',
]

export default function Avatar({ firstName, lastName, size = 36 }: Props) {
  const initials = ((firstName?.[0] || '?') + (lastName?.[0] || '')).toUpperCase()
  const name = (firstName || '') + (lastName || '')
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  const color = COLORS[Math.abs(hash) % COLORS.length]

  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.max(10, Math.floor(size * 0.4)),
      }}
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
    >
      {initials}
    </div>
  )
}
