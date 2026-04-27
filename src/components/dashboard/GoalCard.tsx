type Props = {
  monthlyRevenue: number
  monthlyGoal: number
  wonThisMonth: number
}

export default function GoalCard({ monthlyRevenue, monthlyGoal, wonThisMonth }: Props) {
  const pct = monthlyGoal > 0 ? Math.min(100, Math.round((monthlyRevenue / monthlyGoal) * 100)) : 0

  return (
    <div
      className="rounded-card p-5 flex flex-col justify-between gap-5 text-white h-full min-h-[160px]"
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f52d4 55%, #3730a3 100%)' }}
    >
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Objectif mensuel
        </p>
        <p className="text-[32px] font-black leading-none mt-1">
          {monthlyRevenue.toLocaleString('fr-FR')} €
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          sur {monthlyGoal.toLocaleString('fr-FR')} €
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold">{pct}% atteint</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>
            {wonThisMonth} deal{wonThisMonth !== 1 ? 's' : ''} gagnés
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #ffd700, #ffffff)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
