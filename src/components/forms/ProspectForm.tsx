import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/cn'
import { PIPELINE_STAGES, PRIORITIES, CHANNELS, COMPANY_SIZES, SERVICES, CURRENCIES } from '@/lib/constants'
import type { Prospect, ProspectFormData } from '@/types'

const schema = z.object({
  company_name: z.string().min(1, 'Nom de l\'entreprise requis'),
  sector: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  title: z.string().nullable().optional(),
  email: z.string().email('Email invalide').nullable().or(z.literal('')).optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().default('France'),
  priority: z.enum(['Chaud', 'Tiède', 'Froid']),
  stage: z.enum(['Identifié', 'Premier contact', 'Réponse reçue', 'RDV fixé', 'Devis envoyé', 'En négociation', 'Gagné', 'Perdu']),
  channel: z.enum(['LinkedIn', 'Email froid', 'Instagram/DMs', 'Téléphone/Physique']),
  services_interested: z.array(z.string()).default([]),
  deal_value: z.number().nullable().optional(),
  currency: z.string().default('EUR'),
  next_followup_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect?: Prospect | null
  defaultStage?: string
  onSubmit: (data: ProspectFormData) => Promise<void>
}

const TABS = ['Entreprise', 'Contact', 'CRM'] as const

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary', className)}
      {...props}
    />
  )
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary', className)}
      {...props}
    >
      {children}
    </select>
  )
}

export default function ProspectForm({ open, onOpenChange, prospect, defaultStage, onSubmit }: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>('Entreprise')
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      stage: (defaultStage as FormValues['stage']) ?? 'Identifié',
      priority: 'Froid',
      channel: 'LinkedIn',
      country: 'France',
      currency: 'EUR',
      services_interested: [],
    },
  })

  useEffect(() => {
    if (prospect) {
      reset({
        ...prospect,
        deal_value: prospect.deal_value ?? undefined,
        email: prospect.email ?? '',
      } as FormValues)
    } else {
      reset({
        stage: (defaultStage as FormValues['stage']) ?? 'Identifié',
        priority: 'Froid',
        channel: 'LinkedIn',
        country: 'France',
        currency: 'EUR',
        services_interested: [],
      })
    }
    setTab('Entreprise')
  }, [prospect, defaultStage, open, reset])

  const services = watch('services_interested') ?? []

  const toggleService = (s: string) => {
    setValue('services_interested', services.includes(s) ? services.filter(x => x !== s) : [...services, s])
  }

  const submit = async (values: FormValues) => {
    setSaving(true)
    try {
      await onSubmit({
        ...values,
        sector: values.sector ?? null,
        company_size: (values.company_size as ProspectFormData['company_size']) ?? null,
        website: values.website ?? null,
        linkedin_url: values.linkedin_url ?? null,
        instagram_url: values.instagram_url ?? null,
        title: values.title ?? null,
        email: values.email || null,
        phone: values.phone ?? null,
        city: values.city ?? null,
        deal_value: values.deal_value ?? null,
        next_followup_date: values.next_followup_date ?? null,
        notes: values.notes ?? null,
      } as ProspectFormData)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl max-h-[90vh] flex flex-col">
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
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit(submit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Tab: Entreprise */}
              <div className={cn('grid grid-cols-2 gap-4', tab !== 'Entreprise' && 'hidden')}>
                  <div className="col-span-2">
                    <Field label="Nom de l'entreprise *" error={errors.company_name?.message}>
                      <Input {...register('company_name')} placeholder="Ex: Acme SARL" />
                    </Field>
                  </div>
                  <Field label="Secteur d'activité">
                    <Input {...register('sector')} placeholder="Ex: Restaurant, E-commerce…" />
                  </Field>
                  <Field label="Taille">
                    <Select {...register('company_size')}>
                      <option value="">— Sélectionner —</option>
                      {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Site web actuel">
                    <Input {...register('website')} placeholder="https://…" />
                  </Field>
                  <Field label="URL LinkedIn">
                    <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/…" />
                  </Field>
                  <Field label="URL Instagram">
                    <Input {...register('instagram_url')} placeholder="https://instagram.com/…" />
                  </Field>
                  <Field label="Ville">
                    <Input {...register('city')} placeholder="Paris" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Pays">
                      <Input {...register('country')} placeholder="France" />
                    </Field>
                  </div>
              </div>

              {/* Tab: Contact */}
              <div className={cn('grid grid-cols-2 gap-4', tab !== 'Contact' && 'hidden')}>
                  <Field label="Prénom *" error={errors.first_name?.message}>
                    <Input {...register('first_name')} placeholder="Marie" />
                  </Field>
                  <Field label="Nom *" error={errors.last_name?.message}>
                    <Input {...register('last_name')} placeholder="Dupont" />
                  </Field>
                  <Field label="Poste / Titre">
                    <Input {...register('title')} placeholder="Directrice Marketing" />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input {...register('email')} type="email" placeholder="contact@exemple.fr" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Téléphone">
                      <Input {...register('phone')} placeholder="+33 6 00 00 00 00" />
                    </Field>
                  </div>
              </div>

              {/* Tab: CRM */}
              <div className={cn('grid grid-cols-2 gap-4', tab !== 'CRM' && 'hidden')}>
                  <Field label="Étape du pipeline">
                    <Select {...register('stage')}>
                      {PIPELINE_STAGES.map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  </Field>
                  <Field label="Priorité">
                    <Select {...register('priority')}>
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </Select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="Canal de prospection">
                      <Select {...register('channel')}>
                        {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Services intéressés</label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            services.includes(s)
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="Valeur estimée">
                    <Input
                      type="number"
                      min={0}
                      {...register('deal_value', { valueAsNumber: true })}
                      placeholder="1500"
                    />
                  </Field>
                  <Field label="Devise">
                    <Select {...register('currency')}>
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="Prochain contact">
                      <Input type="date" {...register('next_followup_date')} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="Notes">
                      <textarea
                        {...register('notes')}
                        rows={3}
                        placeholder="Informations supplémentaires…"
                        className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </Field>
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-border px-6 py-4">
              <div className="flex gap-2">
                {TABS.map((t, i) => (
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
                <button
                  type="submit"
                  disabled={saving}
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
