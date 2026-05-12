import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useSubscription, createPortalSession } from '@/hooks/useSubscription'

// Persistent banner shown at the top of the app shell whenever the
// current subscription is in past_due state (Stripe couldn't charge
// the card). The webhook already downgraded prospect_limit to the free
// tier (25), so writes past that quota are blocked by the DB trigger —
// this banner just makes the situation visible and offers a one-click
// fix via the Stripe Customer Portal.
//
// We deliberately don't make this dismissible: the user only sees it
// when their payment is actually failing, and clearing it on close
// would risk them ignoring the issue. The CTA itself is the way out.

export default function PastDueBanner() {
  const { data: subscription } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (subscription?.status !== 'past_due') return null

  const handleClick = async () => {
    setError('')
    setLoading(true)
    try {
      const url = await createPortalSession(window.location.href)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'ouvrir le portail Stripe.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2.5 md:px-6">
      <AlertTriangle size={16} className="text-amber-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          Paiement en échec
        </p>
        <p className="text-xs text-amber-800">
          Le prélèvement de votre abonnement n'a pas pu être effectué.
          Mettez à jour votre carte pour réactiver les fonctionnalités Pro.
        </p>
        {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-btn bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Redirection…' : 'Mettre à jour ma carte'}
      </button>
    </div>
  )
}
