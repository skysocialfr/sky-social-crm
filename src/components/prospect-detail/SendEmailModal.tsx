import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Mail, X, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId: string
  prospectEmail: string
  prospectFirstName: string
}

interface Template {
  id: string
  label: string
  subject: string
  body: (firstName: string) => string
}

const TEMPLATES: Template[] = [
  {
    id: 'followup',
    label: 'Suivi',
    subject: 'Suite à notre échange',
    body: (firstName) =>
      `Bonjour ${firstName},\n\nJe me permets de vous contacter suite à notre échange récent.\n\nJ'espère que vous avez eu l'occasion de réfléchir à notre proposition. N'hésitez pas à me faire part de vos questions ou remarques.\n\nCordialement`,
  },
  {
    id: 'rdv',
    label: 'Confirmation RDV',
    subject: 'Confirmation de notre rendez-vous',
    body: (firstName) =>
      `Bonjour ${firstName},\n\nJe vous confirme notre rendez-vous à venir.\n\nN'hésitez pas à me contacter si vous avez des questions ou si vous souhaitez modifier l'horaire.\n\nÀ très bientôt`,
  },
  {
    id: 'relance',
    label: 'Relance',
    subject: 'Relance — votre projet',
    body: (firstName) =>
      `Bonjour ${firstName},\n\nJe me permets de revenir vers vous concernant notre échange.\n\nAvez-vous eu la possibilité d'avancer sur votre réflexion ? Je reste disponible pour répondre à vos questions.\n\nCordialement`,
  },
  {
    id: 'custom',
    label: 'Personnalisé',
    subject: '',
    body: () => '',
  },
]

export default function SendEmailModal({ open, onOpenChange, prospectId, prospectEmail, prospectFirstName }: Props) {
  const [templateId, setTemplateId] = useState('followup')
  const [subject, setSubject] = useState(TEMPLATES[0].subject)
  const [body, setBody] = useState(TEMPLATES[0].body(prospectFirstName))
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setTemplateId('followup')
      setSubject(TEMPLATES[0].subject)
      setBody(TEMPLATES[0].body(prospectFirstName))
      setSending(false)
      setDone(false)
      setError('')
    }, 300)
  }

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    const t = TEMPLATES.find(t => t.id === id)!
    if (id !== 'custom') {
      setSubject(t.subject)
      setBody(t.body(prospectFirstName))
    } else {
      setSubject('')
      setBody('')
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Objet et message requis.')
      return
    }
    setError('')
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-prospect-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            to: prospectEmail,
            subject: subject.trim(),
            body: body.trim(),
            prospect_id: prospectId,
            prospect_first_name: prospectFirstName,
          }),
        }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Erreur lors de l'envoi")
      }
      await queryClient.invalidateQueries({ queryKey: ['interactions', prospectId] })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[90vh]">

          <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <Dialog.Title className="text-base font-semibold text-foreground">
                Envoyer un email
              </Dialog.Title>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {!done ? (
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">À</p>
                  <p className="text-sm font-medium text-foreground">{prospectEmail}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Modèle</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleTemplateChange(t.id)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          templateId === t.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Objet</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Objet de l'email"
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    placeholder="Rédigez votre message…"
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-emerald-900/30 p-4">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <p className="text-base font-semibold text-foreground">Email envoyé !</p>
                <p className="text-sm text-muted-foreground">
                  L'interaction a été enregistrée dans l'historique.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-border flex-shrink-0">
            {!done ? (
              <>
                <button
                  onClick={handleClose}
                  disabled={sending}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !body.trim()}
                  className={cn(
                    'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
                    (sending || !subject.trim() || !body.trim()) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Send size={14} />
                  {sending ? 'Envoi…' : 'Envoyer'}
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
