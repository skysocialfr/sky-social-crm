import { cloneElement, isValidElement, useEffect, useId, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PRIORITIES, CHANNELS, COMPANY_SIZES, SERVICES, CURRENCIES, DEFAULT_STAGES } from '@/lib/constants'
import { useTheme } from '@/context/ThemeContext'
import { useTeamMembers, useCurrentMember } from '@/hooks/useTeam'
import { usePipelines } from '@/hooks/usePipelines'
import { isSectionVisible, isBuiltinFieldVisible } from '@/lib/visibility'
import { resolveProspectType, getTitleValue } from '@/lib/prospectTypes'
import DynamicFieldInput from '@/components/forms/DynamicFieldInput'
import { BUILTIN_TAB_ORDER, BUILTIN_TAB_DEFAULT_LABELS, PROSPECT_TYPE_KEY } from '@/types'
import type { BuiltInTab, Prospect, ProspectFormData, CustomFieldValue, CustomSection, CustomField, ProspectType } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect?: Prospect | null
  defaultStage?: string
  defaultPipelineId?: string | null
  onSubmit: (data: ProspectFormData) => Promise<void>
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  const id = useId()
  const errorId = useId()

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required || undefined,
      })
    : children

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {child}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
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
  pipeline_id: string
  channel: string
  services_interested: string[]
  deal_value: string
  currency: string
  next_followup_date: string
  notes: string
  custom_data: Record<string, CustomFieldValue>
  assigned_to: string | null
}

const emptyForm = (defaultStage = 'Identifié', defaultPipelineId = ''): FormState => ({
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
  pipeline_id: defaultPipelineId,
  channel: 'LinkedIn',
  services_interested: [],
  deal_value: '',
  currency: 'EUR',
  next_followup_date: '',
  notes: '',
  custom_data: {},
  assigned_to: null,
})

const SUIVI_TAB_ID = '__suivi'

// Group a type's fields into its onglets (sections). With no sections,
// all fields live in a single default tab named after the type.
function typeFieldTabs(type: ProspectType): { id: string; label: string; fields: CustomField[] }[] {
  const secs = (type.sections ?? []).slice().sort((a, b) => a.position - b.position)
  if (!secs.length) return [{ id: '__main', label: type.label, fields: type.fields }]
  const firstId = secs[0].id
  const byId = new Map<string, CustomField[]>(secs.map(s => [s.id, [] as CustomField[]]))
  for (const f of type.fields) {
    const sid = f.section_id && byId.has(f.section_id) ? f.section_id : firstId
    byId.get(sid)!.push(f)
  }
  return secs.map(s => ({ id: s.id, label: s.label, fields: byId.get(s.id)! }))
}

export default function ProspectForm({ open, onOpenChange, prospect, defaultStage, defaultPipelineId, onSubmit }: Props) {
  const { customFieldsSchema } = useTheme()
  const { data: teamMembers = [] } = useTeamMembers()
  const { data: currentMember } = useCurrentMember()
  const { data: pipelines = [] } = usePipelines()
  const isOwner = currentMember?.role === 'owner'

  const [tab, setTab] = useState<string>('company')
  const [form, setForm] = useState<FormState>(emptyForm(defaultStage))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const [wizardShown, setWizardShown] = useState(false)

  const prospectTypes = customFieldsSchema.prospect_types
  const hasTypes = prospectTypes.length > 0
  const selectedType = resolveProspectType(form.custom_data, customFieldsSchema)
  // Type-driven layout when a type is chosen; otherwise the legacy
  // built-in tabs (company / contact / crm).
  const typeMode = !!selectedType

  // Stages of the pipeline currently selected in the form.
  const activeStages = useMemo(() => {
    const id = form.pipeline_id || prospect?.pipeline_id || defaultPipelineId || null
    const pl = id ? pipelines.find(p => p.id === id) : null
    return pl?.stages?.length ? pl.stages : DEFAULT_STAGES
  }, [form.pipeline_id, prospect, defaultPipelineId, pipelines])

  // Tabs to render: type onglets + a fixed "Suivi" tab in type mode,
  // or the three built-in tabs in legacy mode.
  const contentTabs = useMemo(
    () => (selectedType ? typeFieldTabs(selectedType) : []),
    [selectedType],
  )
  const tabs: { id: string; label: string }[] = typeMode
    ? [...contentTabs.map(t => ({ id: t.id, label: t.label })), { id: SUIVI_TAB_ID, label: 'Suivi' }]
    : BUILTIN_TAB_ORDER.map(t => ({ id: t, label: tabLabel(t) }))
  const activeTabId = tabs.some(t => t.id === tab) ? tab : tabs[0]?.id

  function tabLabel(t: BuiltInTab): string {
    return customFieldsSchema.tabs[t].label?.trim() || BUILTIN_TAB_DEFAULT_LABELS[t]
  }

  const isHidden = (t: BuiltInTab, fieldKey: string): boolean =>
    !isBuiltinFieldVisible(customFieldsSchema, t, fieldKey, form.custom_data)

  // Legacy custom sections (only used when no prospect types exist).
  const sectionsFor = (t: BuiltInTab): CustomSection[] =>
    customFieldsSchema.prospect_types.length > 0
      ? []
      : customFieldsSchema.sections
          .filter(s => s.tab === t)
          .filter(s => isSectionVisible(s, form.custom_data))
          .sort((a, b) => a.position - b.position)

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
        pipeline_id: prospect.pipeline_id ?? defaultPipelineId ?? '',
        channel: prospect.channel ?? 'LinkedIn',
        services_interested: prospect.services_interested ?? [],
        deal_value: prospect.deal_value != null ? String(prospect.deal_value) : '',
        currency: prospect.currency ?? 'EUR',
        next_followup_date: prospect.next_followup_date ?? '',
        notes: prospect.notes ?? '',
        custom_data: prospect.custom_data ?? {},
        assigned_to: prospect.assigned_to ?? null,
      })
    } else {
      setForm(emptyForm(defaultStage, defaultPipelineId ?? ''))
    }
    setErrors({})
    setSubmitError('')
    setTab('company')
    // Show the picker whenever we're creating a new prospect and the
    // team has configured at least one type. Editing skips it.
    setWizardShown(!prospect && hasTypes)
  }, [open, prospect, defaultStage, defaultPipelineId, hasTypes])

  const setCustomField = (key: string, value: CustomFieldValue) => {
    setForm(f => {
      const next = { ...f.custom_data }
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete next[key]
      } else {
        next[key] = value
      }
      return { ...f, custom_data: next }
    })
  }

  const pickType = (type: ProspectType) => {
    setCustomField(PROSPECT_TYPE_KEY, type.id)
    const first = typeFieldTabs(type)[0]
    setTab(first?.id ?? SUIVI_TAB_ID)
    setWizardShown(false)
  }

  const set = (key: keyof FormState, value: string | string[]) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const toggleService = (s: string) => {
    const list = form.services_interested
    set('services_interested', list.includes(s) ? list.filter(x => x !== s) : [...list, s])
  }

  const isCustomEmpty = (v: CustomFieldValue | undefined) =>
    v == null || v === '' || (Array.isArray(v) && v.length === 0)

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    // Built-in identity fields are only mandatory in legacy mode; in
    // type mode the type's own (required) fields stand in for them.
    if (!typeMode) {
      if (!form.company_name.trim()) errs.company_name = 'Nom de l\'entreprise requis'
      if (!form.first_name.trim()) errs.first_name = 'Prénom requis'
      if (!form.last_name.trim()) errs.last_name = 'Nom requis'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide'
    setErrors(errs)

    const missingType = (selectedType?.fields ?? []).filter(
      f => f.required && isCustomEmpty(form.custom_data[f.key]),
    )

    if (!typeMode && errs.company_name) setTab('company')
    else if (!typeMode && (errs.first_name || errs.last_name || errs.email)) setTab('contact')
    else if (missingType.length && selectedType) {
      // Jump to the first content tab that holds a missing field.
      const tabsForType = typeFieldTabs(selectedType)
      const target = tabsForType.find(ct => ct.fields.some(f => missingType.includes(f)))
      setTab(target?.id ?? tabsForType[0]?.id ?? SUIVI_TAB_ID)
    }

    if (missingType.length) {
      setSubmitError(`Champs requis manquants : ${missingType.map(f => f.label).join(', ')}.`)
    }
    return Object.keys(errs).length === 0 && missingType.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSubmitError('')
    try {
      // In type mode the prospect's title comes from its type fields and
      // is mirrored into company_name so lists / search / detail keep
      // working without any built-in name field.
      const companyName = (selectedType ? getTitleValue(selectedType, form.custom_data) : '') || form.company_name.trim()
      await onSubmit({
        company_name: companyName,
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
        stage: form.stage,
        pipeline_id: form.pipeline_id,
        channel: form.channel as ProspectFormData['channel'],
        services_interested: form.services_interested,
        deal_value: form.deal_value ? parseFloat(form.deal_value) : null,
        currency: form.currency || 'EUR',
        next_followup_date: form.next_followup_date || null,
        notes: form.notes.trim() || null,
        custom_data: form.custom_data,
        ...(isOwner ? { assigned_to: form.assigned_to } : {}),
      } as ProspectFormData)
      onOpenChange(false)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Erreur lors de la création. Vérifiez votre connexion Supabase.')
    } finally {
      setSaving(false)
    }
  }

  // The CRM / "Suivi" mechanics, shared by the type-mode Suivi tab and
  // the legacy CRM tab.
  const renderSuivi = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {pipelines.length > 1 && (
        <div className="col-span-full">
          <Field label="Leads">
            <select
              className={inputClass}
              value={form.pipeline_id}
              onChange={e => {
                const newPipelineId = e.target.value
                const newPl = pipelines.find(p => p.id === newPipelineId)
                const firstStage = newPl?.stages?.[0]?.label ?? form.stage
                const stageStillValid = newPl?.stages?.some(s => s.label === form.stage)
                setForm(f => ({ ...f, pipeline_id: newPipelineId, stage: stageStillValid ? f.stage : firstStage }))
              }}
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.is_default ? ' (défaut)' : ''}</option>
              ))}
            </select>
          </Field>
        </div>
      )}
      <Field label="Étape du lead">
        <select className={inputClass} value={form.stage} onChange={e => set('stage', e.target.value)}>
          {activeStages.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
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
      {teamMembers.length > 1 && (
        <div className="col-span-full">
          <Field label={isOwner ? 'Assigné à' : 'Assigné à (lecture seule)'}>
            <select
              className={cn(inputClass, !isOwner && 'opacity-60 cursor-not-allowed')}
              value={form.assigned_to ?? ''}
              onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value || null }))}
              disabled={!isOwner}
            >
              <option value="">— Non assigné —</option>
              {teamMembers.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.display_name?.trim() || m.email || m.user_id}{m.role === 'owner' ? ' (propriétaire)' : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
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
  )

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

          {/* Type picker — only when creating + the team has types */}
          {wizardShown && hasTypes && (
            <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
              <div className="mx-auto w-full max-w-xl flex flex-col gap-5">
                <div className="text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">Étape 1 sur 2</p>
                  <h2 className="text-xl font-bold text-text">Quel type de prospect ?</h2>
                  <p className="text-sm text-muted mt-1">Choisis un type pour n'afficher que les informations utiles.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prospectTypes.map((t) => {
                    const accent = t.color || '#6366f1'
                    const active = selectedType?.id === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => pickType(t)}
                        className={cn(
                          'group flex items-center gap-3 rounded-card border bg-card px-4 py-4 text-left transition-all hover:shadow-card',
                          active ? 'border-primary bg-primary-light' : 'border-border hover:border-primary',
                        )}
                      >
                        <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-btn text-xl" style={{ background: `${accent}1a` }}>
                          {t.emoji || '👤'}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-text truncate">{t.label}</span>
                          {t.description && <span className="block text-[12px] text-muted truncate">{t.description}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => { setCustomField(PROSPECT_TYPE_KEY, null); setTab('company'); setWizardShown(false) }}
                  className="text-center text-xs font-medium text-muted hover:text-text transition-colors"
                >
                  Créer sans type
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!wizardShown && (
            <div className="flex border-b border-border px-6 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={cn('flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTabId === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >{t.label}</button>
              ))}
              {selectedType && (
                <div className="ml-auto flex items-center gap-2 py-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ color: selectedType.color || undefined, borderColor: `${selectedType.color || '#6366f1'}55`, background: `${selectedType.color || '#6366f1'}14` }}
                  >
                    <span aria-hidden>{selectedType.emoji || '👤'}</span>
                    {selectedType.label}
                  </span>
                  <button type="button" onClick={() => setWizardShown(true)} className="text-[11px] font-medium text-muted hover:text-primary transition-colors">
                    Changer
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={cn('flex flex-col flex-1 overflow-hidden', wizardShown && 'hidden')}>
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* TYPE MODE: one tab per onglet + the Suivi tab */}
              {typeMode && selectedType && (
                <>
                  {contentTabs.map(ct => (
                    <div key={ct.id} className={cn(activeTabId !== ct.id && 'hidden')}>
                      {ct.fields.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic py-4">
                          Aucun champ dans cet onglet. Ajoute-les depuis Paramètres → Types de prospect.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ct.fields.map(field => {
                            const fullWidth = field.type === 'textarea' || field.type === 'multiselect'
                            return (
                              <div key={field.id} className={cn(fullWidth && 'col-span-full')}>
                                <Field label={field.label} required={field.required}>
                                  <DynamicFieldInput field={field} value={form.custom_data[field.key]} onChange={val => setCustomField(field.key, val)} />
                                </Field>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className={cn(activeTabId !== SUIVI_TAB_ID && 'hidden')}>
                    {renderSuivi()}
                  </div>
                </>
              )}

              {/* LEGACY MODE: built-in company / contact / crm tabs */}
              {!typeMode && (
                <>
                  {/* ENTREPRISE */}
                  <div className={cn('flex flex-col gap-6', activeTabId !== 'company' && 'hidden')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-full">
                        <Field label="Nom de l'entreprise" required error={errors.company_name}>
                          <input className={inputClass} value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Ex: Acme SARL" />
                        </Field>
                      </div>
                      {!isHidden('company', 'sector') && (
                        <Field label="Secteur d'activité">
                          <input className={inputClass} value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="Ex: Restaurant, E-commerce…" />
                        </Field>
                      )}
                      {!isHidden('company', 'company_size') && (
                        <Field label="Taille">
                          <select className={inputClass} value={form.company_size} onChange={e => set('company_size', e.target.value)}>
                            <option value="">— Sélectionner —</option>
                            {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                      )}
                      {!isHidden('company', 'website') && (
                        <Field label="Site web actuel">
                          <input className={inputClass} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" />
                        </Field>
                      )}
                      {!isHidden('company', 'linkedin_url') && (
                        <Field label="URL LinkedIn">
                          <input className={inputClass} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/…" />
                        </Field>
                      )}
                      {!isHidden('company', 'instagram_url') && (
                        <Field label="URL Instagram">
                          <input className={inputClass} value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/…" />
                        </Field>
                      )}
                      {!isHidden('company', 'google_maps_url') && (
                        <div className="col-span-full">
                          <Field label="Fiche Google Maps">
                            <input className={inputClass} value={form.google_maps_url} onChange={e => set('google_maps_url', e.target.value)} placeholder="https://maps.google.com/…" />
                          </Field>
                        </div>
                      )}
                      {!isHidden('company', 'city') && (
                        <Field label="Ville">
                          <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris" />
                        </Field>
                      )}
                      {!isHidden('company', 'country') && (
                        <Field label="Pays">
                          <input className={inputClass} value={form.country} onChange={e => set('country', e.target.value)} placeholder="France" />
                        </Field>
                      )}
                    </div>
                    <CustomSections sections={sectionsFor('company')} data={form.custom_data} onChange={setCustomField} />
                  </div>

                  {/* CONTACT */}
                  <div className={cn('flex flex-col gap-6', activeTabId !== 'contact' && 'hidden')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Prénom" required error={errors.first_name}>
                        <input className={inputClass} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Marie" />
                      </Field>
                      <Field label="Nom" required error={errors.last_name}>
                        <input className={inputClass} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Dupont" />
                      </Field>
                      {!isHidden('contact', 'title') && (
                        <Field label="Poste / Titre">
                          <input className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Directrice Marketing" />
                        </Field>
                      )}
                      {!isHidden('contact', 'email') && (
                        <Field label="Email" error={errors.email}>
                          <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@exemple.fr" />
                        </Field>
                      )}
                      {!isHidden('contact', 'phone') && (
                        <div className="col-span-full">
                          <Field label="Téléphone">
                            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 00 00 00 00" />
                          </Field>
                        </div>
                      )}
                    </div>
                    <CustomSections sections={sectionsFor('contact')} data={form.custom_data} onChange={setCustomField} />
                  </div>

                  {/* CRM */}
                  <div className={cn('flex flex-col gap-6', activeTabId !== 'crm' && 'hidden')}>
                    {renderSuivi()}
                    <CustomSections sections={sectionsFor('crm')} data={form.custom_data} onChange={setCustomField} />
                  </div>
                </>
              )}
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
                {tabs.map(t => (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={cn('h-1.5 w-6 rounded-full transition-colors', activeTabId === t.id ? 'bg-primary' : 'bg-muted')}
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

// Renders legacy custom sections + their fields, used inside each
// built-in tab when no prospect types are configured.
function CustomSections({
  sections,
  data,
  onChange,
}: {
  sections: CustomSection[]
  data: Record<string, CustomFieldValue>
  onChange: (key: string, value: CustomFieldValue) => void
}) {
  if (sections.length === 0) return null
  return (
    <div className="flex flex-col gap-6 border-t border-border pt-5">
      {sections.map(section => (
        <div key={section.id} className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </h3>
          {section.fields.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">Aucun champ dans cette rubrique.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map(field => {
                const fullWidth = field.type === 'textarea' || field.type === 'multiselect'
                return (
                  <div key={field.id} className={cn(fullWidth && 'col-span-full')}>
                    <Field label={field.label} required={field.required}>
                      <DynamicFieldInput
                        field={field}
                        value={data[field.key]}
                        onChange={val => onChange(field.key, val)}
                      />
                    </Field>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
