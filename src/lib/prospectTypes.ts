// Helpers, starter examples and demo data for the "type de prospect"
// model. A prospect's type is stored as a type id in
// custom_data[PROSPECT_TYPE_KEY]; the matching ProspectType (and thus
// its fields) lives in the team's custom_fields_schema.prospect_types.

import { PROSPECT_TYPE_KEY } from '@/types'
import type {
  CustomFieldsSchema,
  CustomFieldValue,
  Prospect,
  ProspectFormData,
  ProspectType,
} from '@/types'

// --- resolution -------------------------------------------------------------

/** The type id stored on a prospect (or undefined if none/legacy). */
export function getProspectTypeId(
  customData: Record<string, CustomFieldValue> | undefined | null,
): string | undefined {
  const v = customData?.[PROSPECT_TYPE_KEY]
  return typeof v === 'string' && v ? v : undefined
}

/** Resolve the ProspectType a prospect belongs to, if any. */
export function resolveProspectType(
  customData: Record<string, CustomFieldValue> | undefined | null,
  schema: Pick<CustomFieldsSchema, 'prospect_types'>,
): ProspectType | undefined {
  const id = getProspectTypeId(customData)
  if (!id) return undefined
  return schema.prospect_types.find((t) => t.id === id)
}

const TITLE_LIKE: ReadonlyArray<string> = ['text', 'textarea', 'url', 'select']

/** The value used as the prospect's display title, derived from the
 *  type's fields: the field flagged `is_title`, else the first
 *  text-like field with a value, else any non-empty value. */
export function getTitleValue(
  type: ProspectType,
  customData: Record<string, CustomFieldValue> | undefined | null,
): string {
  const titled = type.fields.find((f) => f.is_title)
  const order = [
    ...(titled ? [titled] : []),
    ...type.fields.filter((f) => f !== titled && TITLE_LIKE.includes(f.type)),
  ]
  for (const f of order) {
    const v = customData?.[f.key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  for (const f of type.fields) {
    const v = customData?.[f.key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return ''
}

/** Best display title for a prospect: the company_name column if set,
 *  otherwise derived from its type's title field, otherwise the contact
 *  name, otherwise a neutral placeholder. */
export function prospectDisplayName(
  p: { company_name: string; first_name: string; last_name: string; custom_data: Record<string, CustomFieldValue> },
  schema: Pick<CustomFieldsSchema, 'prospect_types'>,
): string {
  if (p.company_name && p.company_name.trim()) return p.company_name.trim()
  const type = resolveProspectType(p.custom_data, schema)
  if (type) {
    const v = getTitleValue(type, p.custom_data)
    if (v) return v
  }
  const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
  return full || 'Sans nom'
}

/** Case-insensitive match of a free-text label to a configured type. */
export function findTypeByLabel(
  label: string,
  schema: Pick<CustomFieldsSchema, 'prospect_types'>,
): ProspectType | undefined {
  const q = label.trim().toLowerCase()
  if (!q) return undefined
  return schema.prospect_types.find(
    (t) => t.label.toLowerCase() === q || t.id.toLowerCase() === q,
  )
}

// A soft palette of accent colors offered when creating a new type.
export const TYPE_COLOR_PRESETS: string[] = [
  '#6366f1', '#db2777', '#7c3aed', '#2563eb',
  '#16a34a', '#d97706', '#0891b2', '#dc2626',
  '#ca8a04', '#4f46e5', '#059669', '#e11d48',
]

// A handful of emoji suggestions for the type picker.
export const TYPE_EMOJI_PRESETS: string[] = [
  '📸', '🎬', '🏢', '🏭', '💰', '🎨', '🤝', '🏛️',
  '🛍️', '🚀', '📰', '🎤', '💼', '🌐', '⭐', '👤',
]

// --- starter examples -------------------------------------------------------
// Stable ids so demo prospects can reference them and so re-loading the
// examples doesn't orphan already-created prospects.

export const EXAMPLE_PROSPECT_TYPES: ProspectType[] = [
  {
    id: 'photographe',
    label: 'Photographe',
    emoji: '📸',
    color: '#db2777',
    description: 'Photographes indépendants ou studios',
    position: 0,
    fields: [
      { id: 'photographe_nom', key: 'photographe_nom', label: 'Nom / Studio', type: 'text', required: true, is_title: true },
      { id: 'photographe_specialite', key: 'photographe_specialite', label: 'Spécialité', type: 'select', options: ['Mariage', 'Portrait', 'Mode', 'Produit', 'Événementiel', 'Immobilier', 'Corporate'] },
      { id: 'photographe_style', key: 'photographe_style', label: 'Style photographique', type: 'text', placeholder: 'Naturel, éditorial…' },
      { id: 'photographe_portfolio', key: 'photographe_portfolio', label: 'Portfolio / Site', type: 'url' },
      { id: 'photographe_tarif', key: 'photographe_tarif', label: 'Tarif journée', type: 'number', isCurrency: true },
      { id: 'photographe_dispo', key: 'photographe_dispo', label: 'Disponibilité', type: 'select', options: ['Immédiate', 'Sous 1 mois', 'Sur devis'] },
    ],
  },
  {
    id: 'videaste',
    label: 'Vidéaste',
    emoji: '🎬',
    color: '#7c3aed',
    description: 'Réalisateurs, monteurs, motion designers',
    position: 1,
    fields: [
      { id: 'videaste_nom', key: 'videaste_nom', label: 'Nom / Studio', type: 'text', required: true, is_title: true },
      { id: 'videaste_specialites', key: 'videaste_specialites', label: 'Spécialités', type: 'multiselect', options: ['Clip', 'Publicité', 'Mariage', 'Documentaire', 'Corporate', 'Réseaux sociaux'] },
      { id: 'videaste_showreel', key: 'videaste_showreel', label: 'Showreel', type: 'url' },
      { id: 'videaste_tarif', key: 'videaste_tarif', label: 'Tarif journée', type: 'number', isCurrency: true },
      { id: 'videaste_materiel', key: 'videaste_materiel', label: 'Équipement (drone, caméra…)', type: 'textarea' },
    ],
  },
  {
    id: 'agence_com',
    label: 'Agence de communication',
    emoji: '🏢',
    color: '#2563eb',
    description: 'Agences créatives, marketing & social media',
    position: 2,
    fields: [
      { id: 'agence_nom', key: 'agence_nom', label: "Nom de l'agence", type: 'text', required: true, is_title: true },
      { id: 'agence_taille', key: 'agence_taille', label: "Taille de l'agence", type: 'select', options: ['Freelance', '2-10', '11-50', '50+'] },
      { id: 'agence_domaines', key: 'agence_domaines', label: 'Domaines', type: 'multiselect', options: ['Branding', 'Social media', 'Print', 'Web', 'Événementiel', 'Relations presse'] },
      { id: 'agence_budget', key: 'agence_budget', label: 'Budget moyen par client', type: 'number', isCurrency: true },
      { id: 'agence_clients', key: 'agence_clients', label: 'Nombre de clients', type: 'number' },
      { id: 'agence_site', key: 'agence_site', label: 'Site web', type: 'url' },
    ],
  },
  {
    id: 'entreprise',
    label: 'Entreprise',
    emoji: '🏭',
    color: '#16a34a',
    description: 'Entreprises à la recherche de prestataires',
    position: 3,
    fields: [
      { id: 'entreprise_nom', key: 'entreprise_nom', label: "Nom de l'entreprise", type: 'text', required: true, is_title: true },
      { id: 'entreprise_secteur', key: 'entreprise_secteur', label: "Secteur d'activité", type: 'text' },
      { id: 'entreprise_besoin', key: 'entreprise_besoin', label: 'Besoin principal', type: 'select', options: ['Photos produits', 'Reportage corporate', 'Portraits équipe', 'Événementiel', 'Contenu réseaux'] },
      { id: 'entreprise_budget', key: 'entreprise_budget', label: 'Budget alloué', type: 'number', isCurrency: true },
      { id: 'entreprise_recurrence', key: 'entreprise_recurrence', label: 'Récurrence du besoin', type: 'select', options: ['Ponctuel', 'Mensuel', 'Trimestriel', 'Annuel'] },
      { id: 'entreprise_echeance', key: 'entreprise_echeance', label: 'Échéance', type: 'date' },
    ],
  },
  {
    id: 'investisseur',
    label: 'Investisseur',
    emoji: '💰',
    color: '#d97706',
    description: 'Business angels, fonds, family offices',
    position: 4,
    fields: [
      { id: 'investisseur_nom', key: 'investisseur_nom', label: 'Nom', type: 'text', required: true, is_title: true },
      { id: 'investisseur_type', key: 'investisseur_type', label: "Type d'investisseur", type: 'select', options: ['Business angel', 'Fonds VC', 'Family office', 'Particulier'] },
      { id: 'investisseur_ticket', key: 'investisseur_ticket', label: "Ticket d'investissement", type: 'number', isCurrency: true },
      { id: 'investisseur_secteurs', key: 'investisseur_secteurs', label: 'Secteurs de prédilection', type: 'multiselect', options: ['Tech', 'Média', 'Créatif', 'Immobilier', 'Autre'] },
      { id: 'investisseur_horizon', key: 'investisseur_horizon', label: "Horizon d'investissement", type: 'select', options: ['Court terme', 'Moyen terme', 'Long terme'] },
      { id: 'investisseur_linkedin', key: 'investisseur_linkedin', label: 'LinkedIn', type: 'url' },
    ],
  },
]

// --- demo prospects ---------------------------------------------------------
// Built as ProspectFormData minus the columns the DB fills via triggers
// (team_id, pipeline_id, assigned_to) — exactly like CSV-imported rows.
// Each carries its type id + a few filled custom fields so the user can
// immediately see the type model at work.

type DemoSeed = {
  company_name: string
  first_name: string
  last_name: string
  email: string
  city: string
  priority: Prospect['priority']
  channel: Prospect['channel']
  deal_value: number
  typeId: string
  custom: Record<string, CustomFieldValue>
}

const DEMO_SEEDS: DemoSeed[] = [
  {
    company_name: 'Studio Lumière', first_name: 'Camille', last_name: 'Robert',
    email: 'camille@studiolumiere.fr', city: 'Lyon', priority: 'Chaud', channel: 'Instagram/DMs', deal_value: 1800,
    typeId: 'photographe',
    custom: { photographe_nom: 'Studio Lumière', photographe_specialite: 'Mariage', photographe_style: 'Naturel & lumineux', photographe_tarif: 1200, photographe_dispo: 'Sous 1 mois', photographe_portfolio: 'https://studiolumiere.fr' },
  },
  {
    company_name: 'Maxime Films', first_name: 'Maxime', last_name: 'Lefebvre',
    email: 'contact@maximefilms.com', city: 'Paris', priority: 'Tiède', channel: 'LinkedIn', deal_value: 3500,
    typeId: 'videaste',
    custom: { videaste_nom: 'Maxime Films', videaste_specialites: ['Publicité', 'Corporate'], videaste_tarif: 2000, videaste_showreel: 'https://vimeo.com/maximefilms' },
  },
  {
    company_name: 'Atelier Pixel', first_name: 'Sophie', last_name: 'Marchand',
    email: 'hello@atelierpixel.fr', city: 'Bordeaux', priority: 'Chaud', channel: 'Email froid', deal_value: 6000,
    typeId: 'agence_com',
    custom: { agence_nom: 'Atelier Pixel', agence_taille: '11-50', agence_domaines: ['Branding', 'Social media', 'Web'], agence_budget: 8000, agence_clients: 24, agence_site: 'https://atelierpixel.fr' },
  },
  {
    company_name: 'Boulangerie Després', first_name: 'Julien', last_name: 'Després',
    email: 'j.depres@despres.fr', city: 'Nantes', priority: 'Froid', channel: 'Téléphone/Physique', deal_value: 900,
    typeId: 'entreprise',
    custom: { entreprise_nom: 'Boulangerie Després', entreprise_secteur: 'Agroalimentaire', entreprise_besoin: 'Photos produits', entreprise_budget: 1500, entreprise_recurrence: 'Trimestriel' },
  },
  {
    company_name: 'Horizon Capital', first_name: 'Élodie', last_name: 'Garnier',
    email: 'e.garnier@horizoncapital.com', city: 'Paris', priority: 'Tiède', channel: 'LinkedIn', deal_value: 50000,
    typeId: 'investisseur',
    custom: { investisseur_nom: 'Horizon Capital', investisseur_type: 'Fonds VC', investisseur_ticket: 50000, investisseur_secteurs: ['Tech', 'Média', 'Créatif'], investisseur_horizon: 'Moyen terme' },
  },
]

/** Build the 5 demo prospects as insertable rows (DB triggers fill the rest). */
export function buildDemoProspects(): ProspectFormData[] {
  return DEMO_SEEDS.map((s) => ({
    company_name: s.company_name,
    first_name: s.first_name,
    last_name: s.last_name,
    email: s.email,
    city: s.city,
    country: 'France',
    priority: s.priority,
    stage: 'Identifié',
    channel: s.channel,
    deal_value: s.deal_value,
    currency: 'EUR',
    services_interested: [],
    custom_data: { [PROSPECT_TYPE_KEY]: s.typeId, ...s.custom },
  })) as unknown as ProspectFormData[]
}
