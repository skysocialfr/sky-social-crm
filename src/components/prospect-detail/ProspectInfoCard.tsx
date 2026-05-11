import { Globe, Linkedin, Instagram, Mail, Phone, Building2, MapPin, Tag, Euro, Check, Minus } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'
import ChannelIcon from '@/components/common/ChannelIcon'
import { useTheme } from '@/context/ThemeContext'
import type { Prospect, SectionPrefs, CustomField } from '@/types'
import { DEFAULT_SECTION_PREFS } from '@/types'

interface Props {
  prospect: Prospect
  sectionPrefs?: SectionPrefs
}

function Row({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value?: string | number | null; href?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline" onClick={e => e.stopPropagation()}>
            {String(value)}
          </a>
        ) : (
          <p className="text-sm text-foreground">{String(value)}</p>
        )}
      </div>
    </div>
  )
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  return false
}

function CustomFieldRow({ field, value, currency }: { field: CustomField; value: unknown; currency: string }) {
  if (isEmpty(value) && field.type !== 'boolean') return null

  return (
    <div className="flex items-start gap-3">
      <Tag size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{field.label}</p>
        <CustomFieldValueDisplay field={field} value={value} currency={currency} />
      </div>
    </div>
  )
}

function CustomFieldValueDisplay({ field, value, currency }: { field: CustomField; value: unknown; currency: string }) {
  switch (field.type) {
    case 'boolean': {
      const v = Boolean(value)
      return (
        <span className="inline-flex items-center gap-1 text-sm text-foreground">
          {v ? <Check size={14} className="text-crm-green" /> : <Minus size={14} className="text-muted-foreground" />}
          {v ? 'Oui' : 'Non'}
        </span>
      )
    }
    case 'date': {
      if (typeof value !== 'string') return <p className="text-sm text-foreground">—</p>
      const d = parseISO(value)
      return (
        <p className="text-sm text-foreground">
          {isValid(d) ? format(d, 'dd MMM yyyy', { locale: fr }) : value}
        </p>
      )
    }
    case 'number': {
      const n = Number(value)
      if (Number.isNaN(n)) return <p className="text-sm text-foreground">—</p>
      const formatted = n.toLocaleString('fr-FR')
      return <p className="text-sm text-foreground">{field.isCurrency ? `${formatted} ${currency}` : formatted}</p>
    }
    case 'multiselect': {
      const list = Array.isArray(value) ? (value as string[]) : []
      if (list.length === 0) return null
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {list.map(v => (
            <span key={v} className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">{v}</span>
          ))}
        </div>
      )
    }
    case 'url': {
      const s = String(value)
      return (
        <a href={s} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all" onClick={e => e.stopPropagation()}>
          {s}
        </a>
      )
    }
    case 'textarea': {
      return <p className="text-sm text-foreground whitespace-pre-wrap">{String(value)}</p>
    }
    default: {
      return <p className="text-sm text-foreground">{String(value)}</p>
    }
  }
}

export default function ProspectInfoCard({ prospect: p, sectionPrefs = DEFAULT_SECTION_PREFS }: Props) {
  const { customFieldsSchema } = useTheme()
  const customData = p.custom_data ?? {}
  const customSections = customFieldsSchema.sections.filter(section =>
    // Only show a section if at least one of its fields has a value
    // (or contains a boolean field — booleans are always meaningful).
    section.fields.some(f => f.type === 'boolean' || !isEmpty(customData[f.key]))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Entreprise */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entreprise</p>
        <Row icon={Building2} label="Entreprise" value={p.company_name} />
        <Row icon={Tag} label="Secteur" value={p.sector} />
        <Row icon={Building2} label="Taille" value={p.company_size} />
        <Row icon={Globe} label="Site web" value={p.website} href={p.website ?? undefined} />
        {sectionPrefs.show_social && (
          <>
            <Row icon={Linkedin} label="LinkedIn" value={p.linkedin_url ? 'Voir profil' : null} href={p.linkedin_url ?? undefined} />
            <Row icon={Instagram} label="Instagram" value={p.instagram_url ? 'Voir profil' : null} href={p.instagram_url ?? undefined} />
            <Row icon={MapPin} label="Fiche Google Maps" value={p.google_maps_url ? 'Voir sur Google Maps' : null} href={p.google_maps_url ?? undefined} />
          </>
        )}
        <Row icon={MapPin} label="Localisation" value={[p.city, p.country].filter(Boolean).join(', ')} />
        {sectionPrefs.show_services && p.services_interested.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Services</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.services_interested.map((s) => (
                  <span key={s} className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {sectionPrefs.show_deal && p.deal_value && (
          <Row icon={Euro} label={`Valeur estimée (${p.currency})`} value={p.deal_value.toLocaleString('fr-FR')} />
        )}
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <Row icon={Building2} label="Nom complet" value={`${p.first_name} ${p.last_name}`} />
        <Row icon={Tag} label="Poste" value={p.title} />
        <Row icon={Mail} label="Email" value={p.email} href={p.email ? `mailto:${p.email}` : undefined} />
        <Row icon={Phone} label="Téléphone" value={p.phone} href={p.phone ? `tel:${p.phone}` : undefined} />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <ChannelIcon channel={p.channel} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Canal principal</p>
            <p className="text-sm text-foreground">{p.channel}</p>
          </div>
        </div>
        {p.notes && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{p.notes}</p>
          </div>
        )}
        </div>
      </div>

      {/* Custom sections — only rendered if the tenant defined at least one
          section that has populated values on this prospect. */}
      {customSections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customSections.map(section => (
            <div key={section.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
              {section.fields.map(field => (
                <CustomFieldRow
                  key={field.id}
                  field={field}
                  value={customData[field.key]}
                  currency={p.currency ?? 'EUR'}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
