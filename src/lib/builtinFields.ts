// Single source of truth for the built-in prospect fields rendered by
// ProspectForm and ProspectInfoCard. Used by the Settings editor to
// show per-field visibility toggles, and by the form/detail to filter
// out fields hidden via custom_fields_schema.tabs.<tab>.hidden_fields.

import type { BuiltInTab } from '@/types'

export interface BuiltInFieldDescriptor {
  key: string          // matches the FormState/Prospect field name
  label: string        // shown in Settings ("masquer ce champ")
  required?: boolean   // some fields can't be hidden (company_name, first/last_name)
}

export const BUILTIN_FIELDS: Record<BuiltInTab, BuiltInFieldDescriptor[]> = {
  company: [
    { key: 'company_name',    label: "Nom de l'entreprise", required: true },
    { key: 'sector',          label: "Secteur d'activité" },
    { key: 'company_size',    label: 'Taille' },
    { key: 'website',         label: 'Site web' },
    { key: 'linkedin_url',    label: 'URL LinkedIn' },
    { key: 'instagram_url',   label: 'URL Instagram' },
    { key: 'google_maps_url', label: 'Fiche Google Maps' },
    { key: 'city',            label: 'Ville' },
    { key: 'country',         label: 'Pays' },
  ],
  contact: [
    { key: 'first_name',      label: 'Prénom',   required: true },
    { key: 'last_name',       label: 'Nom',      required: true },
    { key: 'title',           label: 'Poste / Titre' },
    { key: 'email',           label: 'Email' },
    { key: 'phone',           label: 'Téléphone' },
  ],
  crm: [
    { key: 'stage',                label: 'Étape du pipeline', required: true },
    { key: 'priority',             label: 'Priorité',          required: true },
    { key: 'channel',              label: 'Canal de prospection', required: true },
    { key: 'services_interested',  label: 'Services intéressés' },
    { key: 'deal_value',           label: 'Valeur estimée' },
    { key: 'next_followup_date',   label: 'Prochain contact' },
    { key: 'notes',                label: 'Notes' },
  ],
}

export function isFieldHidden(hiddenList: string[] | undefined, key: string): boolean {
  return !!hiddenList?.includes(key)
}
