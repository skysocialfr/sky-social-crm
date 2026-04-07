import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PIPELINE_STAGES, PRIORITIES, CHANNELS, COMPANY_SIZES, SERVICES, CURRENCIES } from '@/lib/constants'
import type { Prospect, ProspectFormData } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect?: Prospect | null
  defaultStage?: string
  onSubmit: (data: ProspectFormData) => Promise<void>
}

const TABS = ['Entreprise', 'Contact', 'CRM'] as const

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

type FormState = {
  company_name: string
  sector: string
  company_size: string
  website: string
  linkedin_url: string
  instagram_url: string
  google_maps_url: string
  city: string
  country: string
  first_name: string
  last_name: string
  title: string
  email: string
  phone: string
  priority: string
  stage: string
  channel: string
  services_interested: string[]
  deal_value: string
  currency: string
  next_followup_date: string
  notes: string
}

const emptyForm = (defaultStage = 'Identifié'): FormState => ({
  company_name: '',
  sector: '',
  company_size: '',
  website: '',
  linkedin_url: '',
  instagram_url: '',
  google_maps_url: '',
  city: '',
  country: 'France',
  first_name: '',
  last_name: '',
  title: '',
  email: '',
  phone: '',
  priority: 'Froid',
  stage: defaultStage,
  channel: 'LinkedIn',
  services_interested: [],
  deal_value: '',
  currency: 'EUR',
  next_followup_date: '',
  notes: '',
})

export default function ProspectForm({ open, onOpenChange, prospect, defaultStage, onSubmit }: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('Entreprise')
  const [form, setForm] = useState<FormState>(emptyForm(defaultStage))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (prospect) {
      setForm({
        company_name: prospect.company_name ?? '',
        sector: prospect.sector ?? '',
        company_size: prospect.company_size ?? '',
        website: prospect.website ?? '',
        linkedin_url: prospect.linkedin_url ?? '',
        instagram_url: prospect.instagram_url ?? '',
        google_maps_url: prospect.google_maps_url ?? '',
        city: prospect.city ?? '',
        country: prospect.country ?? 'France',
        first_name: prospect.first_name ?? '',
        last_name: prospect.last_name ?? '',
        title: prospect.title ?? '',
        email: prospect.email ?? '',
        phone: prospect.phone ?? '',
        priority: prospect.priority ?? 'Froid',
        stage: prospect.stage ?? 'Identifié',
        channel: prospect.channel ?? 'LinkedIn',
        services_interested: prospect.services_interested ?? [],
        deal_value: prospect.deal_value != null ? String(prospect.deal_value) : '',
        currency: prospect.currency ?? 'EUR',
        next_followup_date: prospect.next_followup_date ?? '',
        notes: prospect.notes ?? '',
      })
    } else {
      setForm(emptyForm(defaultStage))
    }
    setErrors({})
    setSubmitError('')
    setTab('Entreprise')
  }, [open, prospect, defaultStage])

  const set = (key: keyof FormState, value: string | string[]) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const toggleService = (s: string) => {
    const list = form.services_interested
    set('services_interested', list.includes(s) ? list.filter(x => x !== s) : [...list, s])
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.company_name.trim()) errs.company_name = 'Nom de l\'entreprise requis'
    if (!form.first_name.trim()) errs.first_name = 'Prénom requis'
    if (!form.last_name.trim()) errs.last_name = 'Nom requis'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide'
    setErrors(errs)
    if (errs.company_name) setTab('Entreprise')
    else if (errs.first_name || errs.last_name || errs.email) setTab('Contact')
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitError('')
    try {
      await onSubmit({
        company_name: form.company_name.trim(),
        sector: form.sector.trim() || null,
        company_size: (form.company_size || null) as ProspectFormData['company_size'],
        website: form.website.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        google_maps_url: form.google_maps_url.trim() || null,
        city: form.city.trim() || null,
        country: form.country || 'France',
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        title: form.title.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        priority: form.priority as ProspectFormData['priority'],
        stage: form.stage as ProspectFormData['stage'],
        channel: form.channel as ProspectFormData['channel'],
        services_interested: form.services_interested,
        deal_value: form.deal_value ? parseFloat(form.deal_value) : null,
        currency: form.currency || 'EUR',
        next_followup_date: form.next_followup_date || null,
        notes: form.notes.trim() || null,
      })
      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Erreur lors de la création. Vérifiez votre connexion Supabase.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-card md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:border md:border-border md:shadow-2xl md:max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-base font-semibold">
              {prospect ? 'Modifier le prospect' : 'Nouveau prospect'}
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-6">
            {TABS.map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn('px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* ENTREPRISE */}
              <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', tab !== 'Entreprise' && 'hidden')}>
                <div className="col-span-full">
                  <Field label="Nom de l'entreprise" required error={errors.company_name}>
                    <input className={inputClass} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Ex: Acme SARL" />
                  </Field>
                </div>
                <Field label="Secteur d'activité">
                  <input className={inputClass} value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="Ex: Restaurant, E-commerce…" />
                </Field>
                <Field label="Taille">
                  <select className={inputClass} value={form.company_size} onChange={e => set('company_size', e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Site web actuel">
                  <input className={inputClass} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" />
                </Field>
                <Field label="URL LinkedIn">
                  <input className={inputClass} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/…" />
                </Field>
                <Field label="URL Instagram">
                  <input className={inputClass} value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/…" />
                </Field>
                <div className="col-span-full">
                  <Field label="Fiche Google Maps">
                    <input className={inputClass} value={form.google_maps_url} onChange={e => set('google_maps_url', e.target.value)} placeholder="https://maps.google.com/…" />
                  </Field>
                </div>
                <Field label="Ville">
                  <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris" />
                </Field>
                <Field label="Pays">
                  <input className={inputClass} value={form.country} onChange={e => set('country', e.target.value)} placeholder="France" />
                </Field>
              </div>

              {/* CONTACT */}
              <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', tab !== 'Contact' && 'hidden')}>
                <Field label="Prénom" required error={errors.first_name}>
                  <input className={inputClass} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Marie" />
                </Field>
                <Field label="Nom" required error={errors.last_name}>
                  <input className={inputClass} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" />
                </Field>
                <Field label="Poste / Titre">
                  <input className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Directrice Marketing" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@exemple.fr" />
                </Field>
                <div className="col-span-full">
                  <Field label="Téléphone">
                    <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 00 00 00 00" />
                  </Field>
                </div>
              </div>

              {/* CRM */}
              <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', tab !== 'CRM' && 'hidden')}>
                <Field label="Étape du pipeline">
                  <select className={inputClass} value={form.stage} onChange={e => set('stage', e.target.value)}>
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Priorité">
                  <select className={inputClass} value={form.priority} onChange={e => set('priority', e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <div className="col-span-full">
                  <Field label="Canal de prospection">
                    <select className={inputClass} value={form.channel} onChange={e => set('channel', e.target.value)}>
                      {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-full">
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Services intéressés</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(s => (
                      <button key={s} type="button" onClick={() => toggleService(s)}
                        className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          form.services_interested.includes(s)
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        )}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <Field label="Valeur estimée (€)">
                  <input className={inputClass} type="number" min={0} value={form.deal_value} onChange={e => set('deal_value', e.target.value)} placeholder="1500" />
                </Field>
                <Field label="Devise">
                  <select className={inputClass} value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <div className="col-span-full">
                  <Field label="Prochain contact">
                    <input className={inputClass} type="date" value={form.next_followup_date} onChange={e => set('next_followup_date', e.target.value)} />
                  </Field>
                </div>
                <div className="col-span-full">
                  <Field label="Notes">
                    <textarea className={cn(inputClass, 'resize-none')} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Informations supplémentaires…" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="mx-6 mb-2 rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-xs text-red-300">
                ❌ {submitError}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-border px-6 py-4">
              <div className="flex gap-2">
                {TABS.map(t => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className={cn('h-1.5 w-6 rounded-full transition-colors', tab === t ? 'bg-primary' : 'bg-muted')}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button type="button" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Annuler
                  </button>
                </Dialog.Close>
                <button type="submit" disabled={saving}
                  className={cn('rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors', saving && 'opacity-50 cursor-not-allowed')}
                >
                  {saving ? 'Enregistrement…' : prospect ? 'Mettre à jour' : 'Créer le prospect'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
