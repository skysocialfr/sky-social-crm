import * as XLSX from 'xlsx'
import type { Prospect } from '@/types'

const HEADERS: Record<string, string> = {
  company_name: 'Entreprise',
  sector: 'Secteur',
  company_size: 'Taille',
  website: 'Site web',
  linkedin_url: 'LinkedIn',
  instagram_url: 'Instagram',
  first_name: 'Prénom',
  last_name: 'Nom',
  title: 'Poste',
  email: 'Email',
  phone: 'Téléphone',
  city: 'Ville',
  country: 'Pays',
  priority: 'Priorité',
  stage: 'Étape',
  channel: 'Canal',
  services_interested: 'Services',
  deal_value: 'Valeur (€)',
  currency: 'Devise',
  next_followup_date: 'Prochain contact',
  notes: 'Notes',
  created_at: 'Créé le',
}

function flattenProspect(p: Prospect) {
  return {
    Entreprise: p.company_name,
    Secteur: p.sector ?? '',
    Taille: p.company_size ?? '',
    'Site web': p.website ?? '',
    LinkedIn: p.linkedin_url ?? '',
    Instagram: p.instagram_url ?? '',
    Prénom: p.first_name,
    Nom: p.last_name,
    Poste: p.title ?? '',
    Email: p.email ?? '',
    Téléphone: p.phone ?? '',
    Ville: p.city ?? '',
    Pays: p.country,
    Priorité: p.priority,
    Étape: p.stage,
    Canal: p.channel,
    Services: p.services_interested.join('; '),
    'Valeur estimée': p.deal_value ?? '',
    Devise: p.currency,
    'Prochain contact': p.next_followup_date ?? '',
    Notes: p.notes ?? '',
    'Créé le': new Date(p.created_at).toLocaleDateString('fr-FR'),
  }
}

export function exportToExcel(prospects: Prospect[], filename = 'prospects-sky-social') {
  const rows = prospects.map(flattenProspect)
  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = [20,15,15,25,30,30,12,12,15,25,15,15,12,10,18,20,35,12,6,15,40,12]
  ws['!cols'] = colWidths.map(w => ({ wch: w }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Prospects')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToCSV(prospects: Prospect[], filename = 'prospects-sky-social') {
  const rows = prospects.map(flattenProspect)
  const ws = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
