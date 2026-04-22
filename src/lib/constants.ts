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
  'Identifié': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
  'Premier contact': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'Réponse reçue': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  'RDV fixé': 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200',
  'Devis envoyé': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  'En négociation': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  'Gagné': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  'Perdu': 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200',
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
  Chaud: { label: 'Chaud', emoji: '🔥', classes: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' },
  Tiède: { label: 'Tiède', emoji: '🟡', classes: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700' },
  Froid: { label: 'Froid', emoji: '❄️', classes: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700' },
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
