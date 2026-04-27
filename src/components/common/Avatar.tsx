import { dicebearAvatar } from '@/lib/avatar'

interface Props {
  firstName: string
  lastName: string
  size?: number
}

export default function Avatar({ firstName, lastName, size = 36 }: Props) {
  const seed = `${firstName} ${lastName}`.trim()
  return (
    <img
      src={dicebearAvatar(seed || '?')}
      alt={seed}
      width={size}
      height={size}
      className="rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
    />
  )
}
