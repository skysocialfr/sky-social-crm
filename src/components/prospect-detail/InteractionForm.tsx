import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useCreateInteraction } from '@/hooks/useInteractions'
import { useUpdateProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import { INTERACTION_TYPES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { InteractionType } from '@/types'

interface Props {
  prospectId: string
}

export default function InteractionForm({ prospectId }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<InteractionType>('Appel')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [summary, setSummary] = useState('')
  const [outcome, setOutcome] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [followupDate, setFollowupDate] = useState('')
  const [saving, setSaving] = useState(false)

  const createInteraction = useCreateInteraction()
  const updateProspect = useUpdateProspect()
  const { toast } = useToast()

  const reset = () => {
    setSummary(''); setOutcome(''); setNextAction(''); setFollowupDate('')
    setDate(new Date().toISOString().slice(0, 16))
    setType('Appel')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summary.trim()) return
    setSaving(true)
    try {
      await createInteraction.mutateAsync({ prospect_id: prospectId, type, date, summary, outcome: outcome || undefined, next_action: nextAction || undefined })
      if (followupDate) {
        await updateProspect.mutateAsync({ id: prospectId, data: { next_followup_date: followupDate } })
      }
      toast('Interaction ajoutée !')
      reset()
      setOpen(false)
    } catch {
      toast('Erreur lors de l\'ajout', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus size={14} className="text-primary" />
          Ajouter une interaction
        </span>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>

      {open && (
        <form onSubmit={submit} className="border-t border-border px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Type *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as InteractionType)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {INTERACTION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date *</label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Résumé *</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              placeholder="Qu'est-ce qui s'est passé ?"
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Résultat</label>
            <input
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="Ex: Intéressé, demande un devis…"
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Prochaine action</label>
              <input
                value={nextAction}
                onChange={e => setNextAction(e.target.value)}
                placeholder="Envoyer devis…"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Programmer relance</label>
              <input
                type="date"
                value={followupDate}
                onChange={e => setFollowupDate(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { reset(); setOpen(false) }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !summary.trim()}
              className={cn('rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors', (saving || !summary.trim()) && 'opacity-50 cursor-not-allowed')}
            >
              {saving ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
