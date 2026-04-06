import type { PipelineStage, ProspectPriority, ProspectingChannel, CompanySize, InteractionType } from '@/types'

export const PIPELINE_STAGES: PipelineStage[] = [
  'Identifié',
  'Premier contact',
  'Réponse reçue',
  'RDV fixé',
  'Devis envoyé',
  'En négociation',
  'Gagné',
  'Perdu',
]

export const STAGE_COLORS: Record<PipelineStage, string> = {
  'Identifié': 'bg-slate-700 text-slate-200',
  'Premier contact': 'bg-blue-900 text-blue-200',
  'Réponse reçue': 'bg-cyan-900 text-cyan-200',
  'RDV fixé': 'bg-violet-900 text-violet-200',
  'Devis envoyé': 'bg-amber-900 text-amber-200',
  'En négociation': 'bg-orange-900 text-orange-200',
  'Gagné': 'bg-emerald-900 text-emerald-200',
  'Perdu': 'bg-red-900 text-red-200',
}

export const STAGE_DOT_COLORS: Record<PipelineStage, string> = {
  'Identifié': '#64748b',
  'Premier contact': '#3b82f6',
  'Réponse reçue': '#06b6d4',
  'RDV fixé': '#8b5cf6',
  'Devis envoyé': '#f59e0b',
  'En négociation': '#f97316',
  'Gagné': '#10b981',
  'Perdu': '#ef4444',
}

export const PRIORITIES: ProspectPriority[] = ['Chaud', 'Tiède', 'Froid']

export const PRIORITY_CONFIG: Record<ProspectPriority, { label: string; emoji: string; classes: string }> = {
  Chaud: { label: 'Chaud', emoji: '🔥', classes: 'bg-red-900/50 text-red-300 border border-red-700' },
  Tiède: { label: 'Tiède', emoji: '🟡', classes: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' },
  Froid: { label: 'Froid', emoji: '❄️', classes: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
}

export const CHANNELS: ProspectingChannel[] = [
  'LinkedIn',
  'Email froid',
  'Instagram/DMs',
  'Téléphone/Physique',
]

export const COMPANY_SIZES: CompanySize[] = [
  'TPE (1-9)',
  'PME (10-249)',
  'ETI (250-4999)',
  'Grande entreprise (5000+)',
]

export const SERVICES = [
  'Création de site web',
  'Community Management',
  'Création de contenu',
]

export const INTERACTION_TYPES: InteractionType[] = [
  'Appel',
  'Email',
  'LinkedIn',
  'Instagram',
  'Réunion',
  'Devis',
  'Note interne',
]

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CAD', 'CHF']
