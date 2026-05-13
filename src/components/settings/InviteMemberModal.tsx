import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, UserPlus } from 'lucide-react'
import MemberScopeEditor from './MemberScopeEditor'
import { useInviteMember } from '@/hooks/useTeam'
import { useTheme } from '@/context/ThemeContext'
import type { TeamScopes, TeamVisibilityMode } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteMemberModal({ open, onOpenChange }: Props) {
  const { customFieldsSchema } = useTheme()
  const invite = useInviteMember()
  const [email, setEmail] = useState('')
  const [visibilityMode, setVisibilityMode] = useState<TeamVisibilityMode>('scope_only')
  const [scopes, setScopes] = useState<TeamScopes>({})
  const [error, setError] = useState('')

  const reset = () => {
    setEmail('')
    setVisibilityMode('scope_only')
    setScopes({})
    setError('')
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const submit = async () => {
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide.')
      return
    }
    try {
      await invite.mutateAsync({ email, visibility_mode: visibilityMode, scopes })
      handleClose(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'invitation.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-card md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:border md:border-border md:shadow-2xl md:max-h-[90vh]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <Dialog.Title className="flex items-center gap-2 text-base font-semibold">
              <UserPlus size={16} /> Inviter un membre
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:text-text hover:bg-bg transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
            <div>
              <label htmlFor="invite-email" className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                Email du collaborateur
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@exemple.com"
                className="w-full rounded-btn border border-border bg-card px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                autoFocus
              />
              <p className="text-[12px] text-muted mt-1.5">
                Un email avec un lien d'invitation lui sera envoyé. Le lien expire dans 7 jours.
              </p>
            </div>

            <MemberScopeEditor
              schema={customFieldsSchema}
              visibilityMode={visibilityMode}
              scopes={scopes}
              onChangeVisibilityMode={setVisibilityMode}
              onChangeScopes={setScopes}
            />

            {error && (
              <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-btn border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
              >
                Annuler
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={submit}
              disabled={!email || invite.isPending}
              className="rounded-btn bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {invite.isPending ? 'Envoi…' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
