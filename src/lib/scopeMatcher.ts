import type {
  CustomFieldsSchema,
  Prospect,
  TeamMember,
  TeamScopes,
} from '../types'

/**
 * Mirrors the SQL function `prospect_in_user_scope` from migration 011.
 * Used for client-side preview ("show what Marie will see") and to disable
 * action buttons before the server rejects them.
 *
 * Logic, in order:
 *   - Not a team member → false
 *   - Owner of the team → true
 *   - Creator of the prospect → true
 *   - Assigned to the prospect → true
 *   - scopes is empty → true
 *   - Every key in scopes must have its allowed-values list contain
 *     prospect.custom_data[key] (string match).
 */
export function prospectInScope(
  member: Pick<TeamMember, 'role' | 'scopes'> | null,
  prospect: Pick<Prospect, 'user_id' | 'assigned_to' | 'custom_data'>,
  currentUserId: string,
): boolean {
  if (!member) return false
  if (member.role === 'owner') return true
  if (prospect.user_id === currentUserId) return true
  if (prospect.assigned_to === currentUserId) return true

  const keys = Object.keys(member.scopes ?? {})
  if (keys.length === 0) return true

  for (const key of keys) {
    const allowed = member.scopes[key]
    if (!Array.isArray(allowed) || allowed.length === 0) continue
    const actual = prospect.custom_data?.[key]
    if (actual == null) return false
    // Custom-data values may be strings (single select) or string[] (multiselect).
    if (Array.isArray(actual)) {
      if (!actual.some((v) => allowed.includes(String(v)))) return false
    } else if (!allowed.includes(String(actual))) {
      return false
    }
  }
  return true
}

/**
 * SELECT-level visibility: true if the member can see the prospect at all
 * (read-only OK). Combines scope match with the read_all override.
 */
export function prospectVisible(
  member: Pick<TeamMember, 'role' | 'visibility_mode' | 'scopes'> | null,
  prospect: Pick<Prospect, 'user_id' | 'assigned_to' | 'custom_data'>,
  currentUserId: string,
): boolean {
  if (!member) return false
  if (member.role === 'owner') return true
  if (member.visibility_mode === 'read_all') return true
  return prospectInScope(member, prospect, currentUserId)
}

/**
 * UPDATE-level access: true if the member can mutate the prospect.
 * read_all does NOT grant write access — writes still require scope match.
 */
export function prospectEditable(
  member: Pick<TeamMember, 'role' | 'scopes'> | null,
  prospect: Pick<Prospect, 'user_id' | 'assigned_to' | 'custom_data'>,
  currentUserId: string,
): boolean {
  if (!member) return false
  if (member.role === 'owner') return true
  return prospectInScope(member, prospect, currentUserId)
}

/** Returns the list of delegable select fields defined in the team schema. */
export function listDelegableFields(schema: CustomFieldsSchema | null) {
  if (!schema) return []
  return schema.sections.flatMap((section) =>
    section.fields
      .filter((f) => f.type === 'select' && f.delegable && (f.options?.length ?? 0) > 0)
      .map((f) => ({
        key: f.key,
        label: f.label,
        options: f.options ?? [],
        sectionLabel: section.label,
      })),
  )
}
