// Helpers, starter examples and demo data for the "type de prospect"
// model. A prospect's type is stored as a type id in
// custom_data[PROSPECT_TYPE_KEY]; the matching ProspectType (and thus
// its fields) lives in the team's custom_fields_schema.prospect_types.

import { PROSPECT_TYPE_KEY } from '@/types'
import type {
  CustomFieldsSchema,
  CustomFieldValue,
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

// Generic, broadly-applicable starter types — kept deliberately neutral
// so they fit a wide variety of businesses (not one niche industry).
// Stable ids so re-loading examples doesn't orphan existing prospects.
export const EXAMPLE_PROSPECT_TYPES: ProspectType[] = [
  {
    id: 'entreprise_b2b',
    label: 'Entreprise (B2B)',
    emoji: '🏢',
    color: '#2563eb',
    description: 'Sociétés et professionnels',
    position: 0,
    fields: [
      { id: 'b2b_nom', key: 'b2b_nom', label: "Nom de l'entreprise", type: 'text', required: true, is_title: true },
      { id: 'b2b_secteur', key: 'b2b_secteur', label: "Secteur d'activité", type: 'text' },
      { id: 'b2b_contact', key: 'b2b_contact', label: 'Personne de contact', type: 'text' },
      { id: 'b2b_email', key: 'b2b_email', label: 'Email', type: 'text' },
      { id: 'b2b_telephone', key: 'b2b_telephone', label: 'Téléphone', type: 'text' },
      { id: 'b2b_site', key: 'b2b_site', label: 'Site web', type: 'url' },
      { id: 'b2b_budget', key: 'b2b_budget', label: 'Budget estimé', type: 'number', isCurrency: true },
    ],
  },
  {
    id: 'particulier_b2c',
    label: 'Particulier (B2C)',
    emoji: '🧑',
    color: '#16a34a',
    description: 'Clients particuliers',
    position: 1,
    fields: [
      { id: 'b2c_nom', key: 'b2c_nom', label: 'Nom complet', type: 'text', required: true, is_title: true },
      { id: 'b2c_email', key: 'b2c_email', label: 'Email', type: 'text' },
      { id: 'b2c_telephone', key: 'b2c_telephone', label: 'Téléphone', type: 'text' },
      { id: 'b2c_ville', key: 'b2c_ville', label: 'Ville', type: 'text' },
      { id: 'b2c_besoin', key: 'b2c_besoin', label: 'Besoin / Demande', type: 'textarea' },
    ],
  },
  {
    id: 'partenaire',
    label: 'Partenaire',
    emoji: '🤝',
    color: '#7c3aed',
    description: "Partenaires & apporteurs d'affaires",
    position: 2,
    fields: [
      { id: 'partenaire_nom', key: 'partenaire_nom', label: 'Nom', type: 'text', required: true, is_title: true },
      { id: 'partenaire_type', key: 'partenaire_type', label: 'Type de partenariat', type: 'select', options: ["Apporteur d'affaires", 'Revendeur', 'Prescripteur', 'Sponsor', 'Autre'] },
      { id: 'partenaire_email', key: 'partenaire_email', label: 'Email', type: 'text' },
      { id: 'partenaire_telephone', key: 'partenaire_telephone', label: 'Téléphone', type: 'text' },
      { id: 'partenaire_notes', key: 'partenaire_notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 'prestataire',
    label: 'Prestataire / Fournisseur',
    emoji: '🛠️',
    color: '#db2777',
    description: 'Prestataires, freelances & fournisseurs',
    position: 3,
    fields: [
      { id: 'prestataire_nom', key: 'prestataire_nom', label: 'Nom', type: 'text', required: true, is_title: true },
      { id: 'prestataire_specialite', key: 'prestataire_specialite', label: 'Spécialité / Service', type: 'text' },
      { id: 'prestataire_email', key: 'prestataire_email', label: 'Email', type: 'text' },
      { id: 'prestataire_telephone', key: 'prestataire_telephone', label: 'Téléphone', type: 'text' },
      { id: 'prestataire_tarif', key: 'prestataire_tarif', label: 'Tarif indicatif', type: 'number', isCurrency: true },
      { id: 'prestataire_site', key: 'prestataire_site', label: 'Site / Portfolio', type: 'url' },
    ],
  },
  {
    id: 'investisseur',
    label: 'Investisseur',
    emoji: '💰',
    color: '#d97706',
    description: 'Investisseurs & financeurs',
    position: 4,
    fields: [
      { id: 'investisseur_nom', key: 'investisseur_nom', label: 'Nom', type: 'text', required: true, is_title: true },
      { id: 'investisseur_type', key: 'investisseur_type', label: "Type d'investisseur", type: 'select', options: ['Business angel', 'Fonds', 'Banque', 'Subvention', 'Particulier'] },
      { id: 'investisseur_ticket', key: 'investisseur_ticket', label: 'Montant envisagé', type: 'number', isCurrency: true },
      { id: 'investisseur_email', key: 'investisseur_email', label: 'Email', type: 'text' },
      { id: 'investisseur_linkedin', key: 'investisseur_linkedin', label: 'LinkedIn', type: 'url' },
    ],
  },
  {
    id: 'lead_generique',
    label: 'Contact à qualifier',
    emoji: '🎯',
    color: '#0891b2',
    description: 'Lead générique, à trier plus tard',
    position: 5,
    fields: [
      { id: 'lead_nom', key: 'lead_nom', label: 'Nom', type: 'text', required: true, is_title: true },
      { id: 'lead_source', key: 'lead_source', label: 'Source', type: 'select', options: ['Site web', 'Réseaux sociaux', 'Recommandation', 'Salon / Événement', 'Publicité', 'Autre'] },
      { id: 'lead_email', key: 'lead_email', label: 'Email', type: 'text' },
      { id: 'lead_telephone', key: 'lead_telephone', label: 'Téléphone', type: 'text' },
      { id: 'lead_notes', key: 'lead_notes', label: 'Notes', type: 'textarea' },
    ],
  },
]
