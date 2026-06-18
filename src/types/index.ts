// The legacy 8 default stages — kept as a union for the seed
// pipeline created by migration 012 and for the hardcoded fallback
// colors. New custom pipelines use free-form labels (PipelineStage
// = string at the data layer).
export type LegacyPipelineStage =
  | 'Identifié'
  | 'Premier contact'
  | 'Réponse reçue'
  | 'RDV fixé'
  | 'Devis envoyé'
  | 'En négociation'
  | 'Gagné'
  | 'Perdu'

// At the data layer, a stage is just the label string of one of the
// owning pipeline's stages. Validation (label ∈ pipeline.stages) is
// handled in the UI rather than at the DB level.
export type PipelineStage = string

export interface PipelineStageDef {
  label: string
  color: string
}

export interface Pipeline {
  id: string
  team_id: string
  name: string
  stages: PipelineStageDef[]
  is_default: boolean
  position: number
  created_at: string
  updated_at: string
}

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
  team_id: string
  assigned_to: string | null
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
  pipeline_id: string
  channel: ProspectingChannel
  services_interested: string[]
  deal_value: number | null
  currency: string
  next_followup_date: string | null
  notes: string | null
  custom_data: Record<string, CustomFieldValue>
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
  // v3 — sparklines & trends
  sparkProspects: number[]
  sparkRevenue: number[]
  sparkConversion: number[]
  sparkHot: number[]
  totalTrend: number
  revenueTrend: number
  conversionTrend: number
  hotTrend: number
  // v3 — goal & revenue chart
  monthlyRevenue: number
  monthlyGoal: number
  wonThisMonth: number
  revenueMonths: string[]
  revenueWon: number[]
  revenuePipeline: number[]
}

export type ProspectFormData = Omit<Prospect, 'id' | 'user_id' | 'team_id' | 'created_at' | 'updated_at'>

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

export interface NotificationPrefs {
  email_relances_overdue: boolean
  email_weekly_recap: boolean
  email_new_prospect: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email_relances_overdue: true,
  email_weekly_recap: true,
  email_new_prospect: false,
}

export interface UserProfile {
  id: string
  team_id: string | null
  company_name: string
  primary_color: string
  logo_url: string | null
  is_admin: boolean
  suspended: boolean
  section_prefs: SectionPrefs | null
  notification_prefs: NotificationPrefs | null
  created_at: string
  updated_at: string
}

// ============================================================
// Custom fields & sections (per-tenant CRM customization)
// ============================================================

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'url'

export type CustomFieldValue = string | number | boolean | string[] | null

export interface CustomField {
  id: string
  key: string                   // stable slug used as JSONB key in prospects.custom_data
  label: string                 // human label shown in forms and detail
  type: CustomFieldType
  options?: string[]            // required for select / multiselect
  required?: boolean
  placeholder?: string
  isCurrency?: boolean          // formatting hint for type=number
  min?: number
  max?: number
  delegable?: boolean           // type=select only: usable as a team-member territory
  is_type_selector?: boolean    // type=select only: gates the new-prospect form
                                // as a wizard's first step (one per tenant)
  // Type-driven model:
  section_id?: string           // which onglet (ProspectTypeSection) the field sits in
  is_title?: boolean            // this field's value is copied to company_name (the
                                // prospect's display title). One per type.
}

// Conditional visibility: a section or a native field can be marked
// "visible only when discriminator rubric X has value in [Y]".
// `field_key` references a custom select-type rubric stored in
// prospects.custom_data. `values` is the OR list of allowed values.
// Empty values or undefined rule → always visible.
export interface VisibilityRule {
  field_key: string
  values: string[]
}

export interface CustomSection {
  id: string
  label: string
  tab: BuiltInTab               // which built-in tab this section is pinned to
  position: number              // order within its tab
  fields: CustomField[]
  visible_when?: VisibilityRule
}

export type BuiltInTab = 'company' | 'contact' | 'crm'

export const BUILTIN_TAB_ORDER: BuiltInTab[] = ['company', 'contact', 'crm']

export const BUILTIN_TAB_DEFAULT_LABELS: Record<BuiltInTab, string> = {
  company: 'Entreprise',
  contact: 'Contact',
  crm:     'CRM',
}

export interface TabConfig {
  label?: string               // optional override of the default label
  hidden_fields: string[]      // built-in field keys hidden globally for this tenant
  // Per-field conditional visibility, keyed by built-in field key.
  // A field listed here is hidden unless its rule matches. Combined
  // with hidden_fields via OR: a field is visible iff it's not in
  // hidden_fields AND (no rule OR rule matches).
  field_rules?: Record<string, VisibilityRule>
}

// ============================================================
// Prospect types (the simple, client-facing customization model)
// ============================================================
// A "type de prospect" is a named profile (Photographe, Agence de
// com, Investisseur…) that carries its own set of custom fields. When
// creating a prospect the user first picks a type, then only that
// type's fields are asked. This replaces the old, hard-to-configure
// discriminator + conditional-visibility machinery: the type IS the
// discriminator, and there are no rules to wire up.
// An "onglet" inside a type — a named group of fields. The client can
// add/rename/remove these freely; the new-prospect form renders one tab
// per section (plus a fixed "Suivi" tab for CRM mechanics). When a type
// has no sections, all its fields render in a single default tab.
export interface ProspectTypeSection {
  id: string
  label: string
  position: number
}

export interface ProspectType {
  id: string
  label: string                 // "Photographe", "Agence de communication"…
  emoji?: string                // small visual marker shown on the picker card
  color?: string                // hex accent for the card, e.g. '#db2777'
  description?: string          // one-liner shown under the label on the card
  fields: CustomField[]         // the questions asked for this type
  sections?: ProspectTypeSection[] // optional onglets to group the fields
  position: number              // order in the picker
}

// Reserved key inside prospects.custom_data that stores the chosen
// ProspectType id. Underscore-prefixed so it can never collide with a
// user-defined field key (slugify strips leading underscores).
export const PROSPECT_TYPE_KEY = '__type'

export interface CustomFieldsSchema {
  tabs: Record<BuiltInTab, TabConfig>
  sections: CustomSection[]
  prospect_types: ProspectType[]
}

export const DEFAULT_CUSTOM_FIELDS_SCHEMA: CustomFieldsSchema = {
  tabs: {
    company: { hidden_fields: [] },
    contact: { hidden_fields: [] },
    crm:     { hidden_fields: [] },
  },
  sections: [],
  prospect_types: [],
}

// Sanitize a possibly-untyped visibility rule from the DB. Returns
// undefined for malformed rules so callers don't have to defend.
function normalizeRule(raw: unknown): VisibilityRule | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Partial<VisibilityRule>
  if (typeof r.field_key !== 'string' || !r.field_key) return undefined
  const values = Array.isArray(r.values) ? r.values.filter((v): v is string => typeof v === 'string') : []
  if (values.length === 0) return undefined
  return { field_key: r.field_key, values }
}

// Normalize a schema coming from the DB: old rows may be just
// {"sections": []} (pre-tabs migration) and individual sections may
// lack `tab`. Defaults everything to a safe baseline.
export function normalizeSchema(raw: unknown): CustomFieldsSchema {
  const obj = (raw && typeof raw === 'object') ? raw as Partial<CustomFieldsSchema> : {}

  const normalizeTab = (t: Partial<TabConfig> | undefined): TabConfig => ({
    label: typeof t?.label === 'string' ? t.label : undefined,
    hidden_fields: Array.isArray(t?.hidden_fields) ? t.hidden_fields.filter((s): s is string => typeof s === 'string') : [],
    field_rules: t?.field_rules && typeof t.field_rules === 'object'
      ? Object.fromEntries(
          Object.entries(t.field_rules as Record<string, unknown>)
            .map(([k, v]) => [k, normalizeRule(v)] as const)
            .filter((kv): kv is [string, VisibilityRule] => kv[1] !== undefined)
        )
      : undefined,
  })

  const tabs = {
    company: normalizeTab(obj.tabs?.company),
    contact: normalizeTab(obj.tabs?.contact),
    crm:     normalizeTab(obj.tabs?.crm),
  }

  const normalizeFields = (raw: unknown): CustomField[] =>
    (Array.isArray(raw) ? raw : []).map((f) => ({
      ...f,
      delegable: f.type === 'select' ? Boolean(f.delegable) : false,
      is_type_selector: f.type === 'select' ? Boolean(f.is_type_selector) : false,
    })) as CustomField[]

  const sections = (obj.sections ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    tab: (s.tab && BUILTIN_TAB_ORDER.includes(s.tab)) ? s.tab : 'company',
    position: typeof s.position === 'number' ? s.position : 0,
    fields: normalizeFields(s.fields),
    visible_when: normalizeRule((s as { visible_when?: unknown }).visible_when),
  })) as CustomSection[]

  const prospect_types = normalizeProspectTypes(obj.prospect_types, sections, normalizeFields)

  return { tabs, sections, prospect_types }
}

// Deterministic slug used as a stable id for *migrated* prospect types
// so that prospects keep pointing at the right type across reloads
// (we can't use crypto.randomUUID — it would change every load).
function slugId(label: string): string {
  return (
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'type'
  )
}

// Build the prospect_types list. If the row already has a typed list
// we just sanitize it. Otherwise we auto-migrate from the legacy model:
// the old "is_type_selector" select field's options become the types,
// and the custom fields of each conditionally-visible section are
// distributed onto the types they were gated to (always-visible
// sections apply to every type). This means a tenant that configured
// the old discriminator UI gets a working type model for free.
function normalizeProspectTypes(
  raw: unknown,
  sections: CustomSection[],
  normalizeFields: (raw: unknown) => CustomField[],
): ProspectType[] {
  if (Array.isArray(raw)) {
    return raw
      .map((t, i) => {
        const obj = (t && typeof t === 'object') ? t as Partial<ProspectType> : {}
        if (typeof obj.id !== 'string' || typeof obj.label !== 'string') return null
        const sections = Array.isArray(obj.sections)
          ? obj.sections
              .map((s, si) => {
                const so = (s && typeof s === 'object') ? s as Partial<ProspectTypeSection> : {}
                if (typeof so.id !== 'string' || typeof so.label !== 'string') return null
                return { id: so.id, label: so.label, position: typeof so.position === 'number' ? so.position : si }
              })
              .filter((s): s is ProspectTypeSection => s !== null)
              .sort((a, b) => a.position - b.position)
          : undefined
        return {
          id: obj.id,
          label: obj.label,
          emoji: typeof obj.emoji === 'string' ? obj.emoji : undefined,
          color: typeof obj.color === 'string' ? obj.color : undefined,
          description: typeof obj.description === 'string' ? obj.description : undefined,
          fields: normalizeFields(obj.fields),
          sections: sections && sections.length ? sections : undefined,
          position: typeof obj.position === 'number' ? obj.position : i,
        } as ProspectType
      })
      .filter((t): t is ProspectType => t !== null)
      .sort((a, b) => a.position - b.position)
  }

  // --- legacy migration -----------------------------------------------------
  let selector: { key: string; options: string[] } | null = null
  for (const s of sections) {
    for (const f of s.fields) {
      if (f.is_type_selector && f.type === 'select' && Array.isArray(f.options) && f.options.length) {
        selector = { key: f.key, options: f.options }
        break
      }
    }
    if (selector) break
  }
  if (!selector) return []

  const types: ProspectType[] = selector.options.map((opt, i) => ({
    id: slugId(opt),
    label: opt,
    fields: [],
    position: i,
  }))
  const byLabel = new Map(types.map((t) => [t.label, t]))

  for (const section of sections) {
    // Drop the selector field itself — it became the type, not a question.
    const fields = section.fields.filter((f) => !f.is_type_selector)
    if (fields.length === 0) continue
    const rule = section.visible_when
    const targets = rule && rule.field_key === selector.key && rule.values.length
      ? rule.values.map((v) => byLabel.get(v)).filter((t): t is ProspectType => !!t)
      : types // no rule (or unrelated rule) → shared across every type
    for (const t of targets) {
      for (const f of fields) {
        if (!t.fields.some((existing) => existing.key === f.key)) t.fields.push(f)
      }
    }
  }

  return types
}

// ============================================================
// Teams (multi-user accounts)
// ============================================================

export type TeamRole = 'owner' | 'member'

export type TeamVisibilityMode = 'scope_only' | 'read_all'

/** Map of custom-field key → list of allowed values for a team member.
 *  Empty object means "no restriction" (member sees the whole team). */
export type TeamScopes = Record<string, string[]>

export interface Team {
  id: string
  owner_id: string
  name: string
  custom_fields_schema: CustomFieldsSchema | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  team_id: string
  user_id: string
  role: TeamRole
  visibility_mode: TeamVisibilityMode
  scopes: TeamScopes
  joined_at: string
  /** Hydrated by useTeamMembers — joined from auth.users via RPC. */
  email?: string | null
  /** Hydrated by useTeamMembers — joined from user_profiles. */
  display_name?: string | null
}

export type TeamInviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export interface TeamInvite {
  id: string
  team_id: string
  email: string
  invited_by: string
  visibility_mode: TeamVisibilityMode
  scopes: TeamScopes
  token: string
  status: TeamInviteStatus
  created_at: string
  expires_at: string
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
