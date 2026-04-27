import { dicebearAvatar } from '@/lib/avatar'

const MOCK_TEAM = [
  { name: 'Marie Laurent', deals: 12, revenue: 48000, rate: 76 },
  { name: 'Thomas Duval', deals: 9, revenue: 36000, rate: 64 },
  { name: 'Lucie Martin', deals: 7, revenue: 28000, rate: 58 },
  { name: 'Alex Bernard', deals: 5, revenue: 20000, rate: 44 },
]
const MEDALS = ['🥇', '🥈', '🥉', '']

export default function TeamCard() {
  return (
    <div className="rounded-card shadow-card border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-text">🏆 Classement équipe</p>
        <span className="text-[10px] font-semibold text-subtle bg-bg border border-border px-2 py-0.5 rounded-pill">
          Mock
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {MOCK_TEAM.map((m, i) => (
          <div key={m.name} className="flex items-center gap-2.5">
            <span className="text-sm w-5 flex-shrink-0 text-center">{MEDALS[i]}</span>
            <img
              src={dicebearAvatar(m.name)}
              alt=""
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-text truncate">{m.name}</span>
                <span className="text-[11px] font-bold text-primary ml-1">{m.deals}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${m.rate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
