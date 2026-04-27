import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Zap, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { createCheckoutSession } from '@/hooks/useSubscription'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PRO_FEATURES = [
  'Prospects illimités',
  'Import CSV/Excel',
  'Email direct aux prospects',
  'Personnalisation des rubriques',
  'Export Excel/CSV',
]

export default function UpgradeModal({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setError('')
    setLoading(true)
    try {
      const url = await createCheckoutSession(window.location.href)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">

          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Zap size={22} className="text-primary" />
            </div>
            <Dialog.Title className="text-lg font-bold text-foreground">
              Passez au plan Pro
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
              Vous avez atteint la limite de 25 prospects du plan gratuit.
            </Dialog.Description>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center mb-5">
            <p className="text-3xl font-bold text-foreground">
              9€
              <span className="text-base font-normal text-muted-foreground"> / mois</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sans engagement · Annulable à tout moment</p>
          </div>

          <ul className="mb-6 space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="mb-3 text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Zap size={15} />
            {loading ? 'Redirection…' : 'Passer au Pro — 9€/mois'}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
