import * as XLSX from 'xlsx'
import type {
  ProspectFormData, ProspectPriority, ProspectingChannel, CompanySize, Prospect,
  ProspectType, CustomField, CustomFieldValue,
} from '@/types'
import { PROSPECT_TYPE_KEY } from '@/types'
import { findTypeByLabel } from '@/lib/prospectTypes'
import { PRIORITIES, CHANNELS, COMPANY_SIZES } from '@/lib/constants'

// Special mapping target: a file column that carries the prospect type
// (resolved to a configured type by label). Custom-field targets use
// the `custom:<fieldKey>` form.
export const TYPE_TARGET = '__type'
export const CUSTOM_PREFIX = 'custom:'

/** A column can map to a built-in field, the prospect type, a custom
 *  field (`custom:<key>`), or be ignored. */
export type MapTarget = keyof ProspectFormData | typeof TYPE_TARGET | string | '_ignore'

export const FIELD_LABELS: Partial<Record<keyof ProspectFormData, string>> = {
  company_name: 'Entreprise *',
  first_name: 'Prénom *',
  last_name: 'Nom *',
  channel: 'Canal *',
  email: 'Email',
  phone: 'Téléphone',
  title: 'Poste',
  sector: 'Secteur',
  city: 'Ville',
  country: 'Pays',
  website: 'Site web',
  linkedin_url: 'LinkedIn',
  instagram_url: 'Instagram',
  priority: 'Priorité',
  stage: 'Étape',
  deal_value: 'Valeur estimée',
  notes: 'Notes',
  next_followup_date: 'Prochain contact',
  company_size: 'Taille entreprise',
  services_interested: 'Services (séparés par ;)',
}

const COLUMN_ALIASES: Record<string, keyof ProspectFormData> = {
  'entreprise': 'company_name', 'company_name': 'company_name', 'société': 'company_name',
  'societe': 'company_name', 'nom entreprise': 'company_name', 'company': 'company_name',
  'prénom': 'first_name', 'prenom': 'first_name', 'first_name': 'first_name', 'firstname': 'first_name',
  'nom': 'last_name', 'last_name': 'last_name', 'lastname': 'last_name',
  'canal': 'channel', 'channel': 'channel',
  'email': 'email', 'courriel': 'email',
  'téléphone': 'phone', 'telephone': 'phone', 'phone': 'phone', 'tel': 'phone',
  'poste': 'title', 'title': 'title', 'fonction': 'title',
  'secteur': 'sector', 'sector': 'sector', 'industrie': 'sector',
  'ville': 'city', 'city': 'city',
  'pays': 'country', 'country': 'country',
  'site web': 'website', 'website': 'website', 'site': 'website',
  'linkedin': 'linkedin_url', 'linkedin_url': 'linkedin_url',
  'instagram': 'instagram_url', 'instagram_url': 'instagram_url',
  'priorité': 'priority', 'priorite': 'priority', 'priority': 'priority',
  'étape': 'stage', 'etape': 'stage', 'stage': 'stage', 'statut': 'stage',
  'valeur': 'deal_value', 'deal_value': 'deal_value', 'valeur estimée': 'deal_value',
  'notes': 'notes', 'commentaires': 'notes',
  'prochain contact': 'next_followup_date', 'next_followup_date': 'next_followup_date', 'relance': 'next_followup_date',
  'taille': 'company_size', 'company_size': 'company_size', 'taille entreprise': 'company_size',
  'services': 'services_interested', 'services_interested': 'services_interested',
}

// Column headers that should auto-map to the prospect type.
const TYPE_COLUMN_ALIASES = new Set<string>([
  'type', 'type de prospect', 'type prospect', 'catégorie', 'categorie', 'profil',
])

function parseCustomValue(field: CustomField | undefined, raw: string): CustomFieldValue {
  if (!field) return raw
  switch (field.type) {
    case 'number': {
      const n = parseFloat(raw.replace(',', '.').replace(/[\s€$£%]/g, ''))
      return Number.isNaN(n) ? null : n
    }
    case 'multiselect':
      return raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)
    case 'boolean':
      return /^(oui|yes|true|vrai|1|x)$/i.test(raw.trim())
    default:
      return raw
  }
}

export interface ParsedRow {
  index: number
  data: Partial<ProspectFormData>
  errors: string[]
}

export interface ParseResult {
  headers: string[]
  rawRows: Record<string, string>[]
  rows: ParsedRow[]
  validCount: number
  errorCount: number
}

function normalizeEnum<T extends string>(value: string, validValues: T[]): T | null {
  const v = value.trim()
  return validValues.find(s => s === v) ?? validValues.find(s => s.toLowerCase() === v.toLowerCase()) ?? null
}

export function parseFile(file: File): Promise<{ headers: string[]; rawRows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '', raw: false })
        resolve({ headers: json.length > 0 ? Object.keys(json[0]) : [], rawRows: json })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsArrayBuffer(file)
  })
}

export function autoDetectMapping(headers: string[]): Record<string, MapTarget> {
  const mapping: Record<string, MapTarget> = {}
  for (const h of headers) {
    const key = h.toLowerCase().trim()
    if (TYPE_COLUMN_ALIASES.has(key)) mapping[h] = TYPE_TARGET
    else mapping[h] = COLUMN_ALIASES[key] ?? '_ignore'
  }
  return mapping
}

export interface ImportContext {
  prospectTypes?: ProspectType[]
  /** Type applied to every row unless a column overrides it per-row. */
  defaultTypeId?: string
}

export function computeResult(
  headers: string[],
  rawRows: Record<string, string>[],
  mapping: Record<string, MapTarget>,
  ctx: ImportContext = {}
): ParseResult {
  const prospectTypes = ctx.prospectTypes ?? []
  // Flatten every type's fields so a `custom:<key>` target can be parsed
  // even when the row's type is driven by a column.
  const fieldByKey = new Map<string, CustomField>()
  for (const t of prospectTypes) for (const f of t.fields) fieldByKey.set(f.key, f)

  const rows: ParsedRow[] = rawRows.map((raw, index) => {
    const custom_data: Record<string, CustomFieldValue> = {}
    if (ctx.defaultTypeId) custom_data[PROSPECT_TYPE_KEY] = ctx.defaultTypeId
    const data: Partial<ProspectFormData> = {
      stage: 'Identifié',
      priority: 'Froid',
      channel: 'LinkedIn',
      country: 'France',
      currency: 'EUR',
      services_interested: [],
      custom_data,
    }
    const errors: string[] = []

    for (const [csvCol, field] of Object.entries(mapping)) {
      if (field === '_ignore') continue
      const rawVal = String(raw[csvCol] ?? '').trim()
      if (!rawVal) continue

      if (field === TYPE_TARGET) {
        const matched = findTypeByLabel(rawVal, { prospect_types: prospectTypes })
        if (matched) custom_data[PROSPECT_TYPE_KEY] = matched.id
        else if (prospectTypes.length) errors.push(`Type inconnu : "${rawVal}"`)
        continue
      }
      if (field.startsWith(CUSTOM_PREFIX)) {
        const key = field.slice(CUSTOM_PREFIX.length)
        const parsed = parseCustomValue(fieldByKey.get(key), rawVal)
        if (parsed !== null && !(Array.isArray(parsed) && parsed.length === 0)) custom_data[key] = parsed
        continue
      }

      switch (field) {
        case 'stage': {
          // Stages are pipeline-defined and free-form. We accept any
          // non-empty string. Labels that don't match the target
          // pipeline's stages will appear as "orphan" stages the
          // user can clean up post-import.
          data.stage = rawVal
          break
        }
        case 'priority': {
          const v = normalizeEnum(rawVal, [...PRIORITIES] as ProspectPriority[])
          if (v) data.priority = v
          else errors.push(`Priorité invalide: "${rawVal}"`)
          break
        }
        case 'channel': {
          const v = normalizeEnum(rawVal, [...CHANNELS] as ProspectingChannel[])
          if (v) data.channel = v
          else errors.push(`Canal invalide: "${rawVal}"`)
          break
        }
        case 'company_size': {
          const v = normalizeEnum(rawVal, [...COMPANY_SIZES] as CompanySize[])
          if (v) data.company_size = v
          break
        }
        case 'deal_value': {
          const n = parseFloat(rawVal.replace(',', '.').replace(/[\s€$£]/g, ''))
          if (!isNaN(n)) data.deal_value = n
          break
        }
        case 'services_interested': {
          data.services_interested = rawVal.split(';').map(s => s.trim()).filter(Boolean)
          break
        }
        default:
          ;(data as Record<string, unknown>)[field] = rawVal
      }
    }

    if (!data.company_name) errors.push('Entreprise manquante')
    if (!data.first_name) errors.push('Prénom manquant')
    if (!data.last_name) errors.push('Nom manquant')

    return { index, data, errors }
  })

  const validCount = rows.filter(r => r.errors.length === 0).length
  return { headers, rawRows, rows, validCount, errorCount: rows.length - validCount }
}

export function getValidRows(rows: ParsedRow[]): ProspectFormData[] {
  return rows.filter(r => r.errors.length === 0).map(r => r.data as ProspectFormData)
}

const EXPORT_COLUMNS: { key: keyof Prospect; label: string }[] = [
  { key: 'company_name',        label: 'Entreprise' },
  { key: 'first_name',          label: 'Prénom' },
  { key: 'last_name',           label: 'Nom' },
  { key: 'title',               label: 'Poste' },
  { key: 'email',               label: 'Email' },
  { key: 'phone',               label: 'Téléphone' },
  { key: 'channel',             label: 'Canal' },
  { key: 'stage',               label: 'Étape' },
  { key: 'priority',            label: 'Priorité' },
  { key: 'sector',              label: 'Secteur' },
  { key: 'company_size',        label: 'Taille' },
  { key: 'city',                label: 'Ville' },
  { key: 'country',             label: 'Pays' },
  { key: 'website',             label: 'Site web' },
  { key: 'linkedin_url',        label: 'LinkedIn' },
  { key: 'instagram_url',       label: 'Instagram' },
  { key: 'deal_value',          label: 'Valeur' },
  { key: 'currency',            label: 'Devise' },
  { key: 'next_followup_date',  label: 'Prochain contact' },
  { key: 'notes',               label: 'Notes' },
  { key: 'created_at',          label: 'Créé le' },
]

export function exportProspectsToCsv(prospects: Prospect[]): void {
  const rows = prospects.map(p => {
    const row: Record<string, string | number | null> = {}
    for (const { key, label } of EXPORT_COLUMNS) {
      const value = p[key]
      if (Array.isArray(value)) row[label] = value.join('; ')
      else row[label] = (value as string | number | null) ?? ''
    }
    row['Services'] = p.services_interested.join('; ')
    return row
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Prospects')
  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `prospects-${today}.csv`, { bookType: 'csv' })
}
