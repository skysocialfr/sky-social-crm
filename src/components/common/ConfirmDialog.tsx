import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
}

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, loading }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="text-destructive" size={20} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition-colors',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
