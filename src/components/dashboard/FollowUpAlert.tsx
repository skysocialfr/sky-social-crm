import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface Props {
  overdue: number
  today: number
}

export default function FollowUpAlert({ overdue, today }: Props) {
  const navigate = useNavigate()
  if (overdue === 0 && today === 0) return null

  return (
    <div
      onClick={() => navigate('/relances')}
      className="cursor-pointer flex items-center justify-between rounded-xl border border-red-700 bg-red-900/20 px-5 py-3 hover:bg-red-900/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-200">
          {overdue > 0 && <span className="font-semibold">{overdue} relance{overdue > 1 ? 's' : ''} en retard</span>}
          {overdue > 0 && today > 0 && ' · '}
          {today > 0 && <span>{today} relance{today > 1 ? 's' : ''} aujourd'hui</span>}
        </p>
      </div>
      <ArrowRight size={14} className="text-red-400 flex-shrink-0" />
    </div>
  )
}
