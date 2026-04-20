import * as XLSX from 'xlsx'
import type { ProspectFormData, PipelineStage, ProspectPriority, ProspectingChannel, CompanySize } from '@/types'
import { PIPELINE_STAGES, PRIORITIES, CHANNELS, COMPANY_SIZES } from '@/lib/constants'

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

export function autoDetectMapping(headers: string[]): Record<string, keyof ProspectFormData | '_ignore'> {
  const mapping: Record<string, keyof ProspectFormData | '_ignore'> = {}
  for (const h of headers) {
    mapping[h] = COLUMN_ALIASES[h.toLowerCase().trim()] ?? '_ignore'
  }
  return mapping
}

export function computeResult(
  headers: string[],
  rawRows: Record<string, string>[],
  mapping: Record<string, keyof ProspectFormData | '_ignore'>
): ParseResult {
  const rows: ParsedRow[] = rawRows.map((raw, index) => {
    const data: Partial<ProspectFormData> = {
      stage: 'Identifié',
      priority: 'Froid',
      channel: 'LinkedIn',
      country: 'France',
      currency: 'EUR',
      services_interested: [],
    }
    const errors: string[] = []

    for (const [csvCol, field] of Object.entries(mapping)) {
      if (field === '_ignore') continue
      const rawVal = String(raw[csvCol] ?? '').trim()
      if (!rawVal) continue

      switch (field) {
        case 'stage': {
          const v = normalizeEnum(rawVal, [...PIPELINE_STAGES] as PipelineStage[])
          if (v) data.stage = v
          else errors.push(`Étape invalide: "${rawVal}"`)
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
