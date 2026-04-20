export type PipelineStage =
  | 'Identifié'
  | 'Premier contact'
  | 'Réponse reçue'
  | 'RDV fixé'
  | 'Devis envoyé'
  | 'En négociation'
  | 'Gagné'
  | 'Perdu'

export type ProspectPriority = 'Chaud' | 'Tiède' | 'Froid'

export type ProspectingChannel =
  | 'LinkedIn'
  | 'Email froid'
  | 'Instagram/DMs'
  | 'Téléphone/Physique'

export type CompanySize =
  | 'TPE (1-9)'
  | 'PME (10-249)'
  | 'ETI (250-4999)'
  | 'Grande entreprise (5000+)'

export type InteractionType =
  | 'Appel'
  | 'Email'
  | 'LinkedIn'
  | 'Instagram'
  | 'Réunion'
  | 'Devis'
  | 'Note interne'

export interface Prospect {
  id: string
  user_id: string
  company_name: string
  sector: string | null
  company_size: CompanySize | null
  website: string | null
  linkedin_url: string | null
  instagram_url: string | null
  google_maps_url: string | null
  first_name: string
  last_name: string
  title: string | null
  email: string | null
  phone: string | null
  city: string | null
  country: string
  priority: ProspectPriority
  stage: PipelineStage
  channel: ProspectingChannel
  services_interested: string[]
  deal_value: number | null
  currency: string
  next_followup_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  prospect_id: string
  user_id: string
  type: InteractionType
  date: string
  summary: string
  outcome: string | null
  next_action: string | null
  created_at: string
}

export interface DashboardStats {
  totalProspects: number
  potentialRevenue: number
  conversionRate: number
  hotProspects: number
  followupToday: number
  followupOverdue: number
  byStage: { stage: PipelineStage; count: number; value: number }[]
  byChannel: { channel: string; count: number }[]
}

export type ProspectFormData = Omit<Prospect, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface SectionPrefs {
  show_followup: boolean
  show_interactions: boolean
  show_services: boolean
  show_deal: boolean
  show_social: boolean
}

export const DEFAULT_SECTION_PREFS: SectionPrefs = {
  show_followup: true,
  show_interactions: true,
  show_services: true,
  show_deal: true,
  show_social: true,
}

export interface UserProfile {
  id: string
  company_name: string
  primary_color: string
  logo_url: string | null
  is_admin: boolean
  suspended: boolean
  section_prefs: SectionPrefs | null
  created_at: string
  updated_at: string
}

export interface AdminUserView {
  id: string
  email: string
  company_name: string
  primary_color: string
  logo_url: string | null
  is_admin: boolean
  suspended: boolean
  prospect_count: number
  last_sign_in_at: string | null
  subscription_status: string
  created_at: string
}
