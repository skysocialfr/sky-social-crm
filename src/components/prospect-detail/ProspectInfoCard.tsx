import { Globe, Linkedin, Instagram, Mail, Phone, Building2, MapPin, Tag, Euro } from 'lucide-react'
import ChannelIcon from '@/components/common/ChannelIcon'
import type { Prospect, SectionPrefs } from '@/types'
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

export default function ProspectInfoCard({ prospect: p, sectionPrefs = DEFAULT_SECTION_PREFS }: Props) {
  return (
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
  )
}
