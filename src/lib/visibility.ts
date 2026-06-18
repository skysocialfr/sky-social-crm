import type { CustomFieldValue, VisibilityRule, CustomFieldsSchema, BuiltInTab } from '@/types'

// Resolve whether a rule passes given the current custom_data of
// the form/prospect. The rule's field_key references a custom
// rubric whose value lives in custom_data.
//
// Semantics:
//   - No rule          → always visible
//   - String value     → match if it's in the allowed list
//   - Array value      → match if intersection is non-empty
//   - Anything else    → no match
//
// We deliberately treat missing/empty data as "no match" so the
// fields stay hidden until the user picks a discriminator, which is
// the expected UX for a conditional form.
export function ruleMatches(
  rule: VisibilityRule | undefined,
  customData: Record<string, CustomFieldValue> | undefined,
): boolean {
  if (!rule || rule.values.length === 0) return true
  const value = customData?.[rule.field_key]
  if (value == null) return false
  if (typeof value === 'string') return rule.values.includes(value)
  if (Array.isArray(value)) return value.some((v) => rule.values.includes(v))
  return false
}

// Convenience: is a section currently visible?
export function isSectionVisible(
  section: { visible_when?: VisibilityRule },
  customData: Record<string, CustomFieldValue> | undefined,
): boolean {
  return ruleMatches(section.visible_when, customData)
}

// Convenience: is a built-in field currently visible? Combines
// global hiding (hidden_fields) with per-field conditional rules.
export function isBuiltinFieldVisible(
  schema: CustomFieldsSchema,
  tab: BuiltInTab,
  fieldKey: string,
  customData: Record<string, CustomFieldValue> | undefined,
): boolean {
  const tabConfig = schema.tabs[tab]
  if (tabConfig.hidden_fields.includes(fieldKey)) return false
  const rule = tabConfig.field_rules?.[fieldKey]
  return ruleMatches(rule, customData)
}

// Discover which custom rubrics are eligible to be discriminators
// (i.e. select-type fields). Their values can then be referenced by
// VisibilityRule.field_key. Multi-select rubrics qualify too — the
// rule matches if any selected value is allowed.
export function discriminatorCandidates(schema: CustomFieldsSchema): Array<{
  key: string
  label: string
  options: string[]
  sectionLabel: string
}> {
  const out: Array<{ key: string; label: string; options: string[]; sectionLabel: string }> = []
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if ((field.type === 'select' || field.type === 'multiselect') && Array.isArray(field.options)) {
        out.push({
          key: field.key,
          label: field.label,
          options: field.options,
          sectionLabel: section.label,
        })
      }
    }
  }
  return out
}

// The rubric that gates the new-prospect form as a wizard's first
// step. Only one can be active at a time (the first one found wins
// if the owner accidentally marks several). Returns null if no
// rubric is currently designated as the type selector.
export function findTypeSelector(schema: CustomFieldsSchema): {
  key: string
  label: string
  options: string[]
} | null {
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.is_type_selector && field.type === 'select' && Array.isArray(field.options) && field.options.length > 0) {
        return { key: field.key, label: field.label, options: field.options }
      }
    }
  }
  return null
}
