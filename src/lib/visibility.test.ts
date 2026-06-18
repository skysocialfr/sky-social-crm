import { describe, it, expect } from 'vitest'
import { ruleMatches, isSectionVisible, isBuiltinFieldVisible, discriminatorCandidates } from './visibility'
import type { CustomFieldsSchema, VisibilityRule } from '@/types'

describe('ruleMatches', () => {
  it('returns true when no rule (always visible)', () => {
    expect(ruleMatches(undefined, {})).toBe(true)
    expect(ruleMatches({ field_key: 'x', values: [] }, { x: 'foo' })).toBe(true)
  })

  it('matches a string custom_data value', () => {
    const rule: VisibilityRule = { field_key: 'type_acteur', values: ['Prestataire', 'B2C'] }
    expect(ruleMatches(rule, { type_acteur: 'Prestataire' })).toBe(true)
    expect(ruleMatches(rule, { type_acteur: 'B2C' })).toBe(true)
    expect(ruleMatches(rule, { type_acteur: 'B2B' })).toBe(false)
  })

  it('matches a multi-select value (any selected option in allowed list)', () => {
    const rule: VisibilityRule = { field_key: 'specialites', values: ['Mariage'] }
    expect(ruleMatches(rule, { specialites: ['Mariage', 'Portrait'] })).toBe(true)
    expect(ruleMatches(rule, { specialites: ['Portrait', 'Corporate'] })).toBe(false)
  })

  it('treats null/empty data as no match', () => {
    const rule: VisibilityRule = { field_key: 'type_acteur', values: ['Prestataire'] }
    expect(ruleMatches(rule, {})).toBe(false)
    expect(ruleMatches(rule, undefined)).toBe(false)
    expect(ruleMatches(rule, { type_acteur: null })).toBe(false)
  })
})

describe('isSectionVisible', () => {
  it('returns true for sections without a rule', () => {
    expect(isSectionVisible({}, {})).toBe(true)
  })

  it('respects the rule when defined', () => {
    const section = { visible_when: { field_key: 'type_acteur', values: ['Prestataire'] } }
    expect(isSectionVisible(section, { type_acteur: 'Prestataire' })).toBe(true)
    expect(isSectionVisible(section, { type_acteur: 'B2C' })).toBe(false)
  })
})

describe('isBuiltinFieldVisible', () => {
  const baseSchema: CustomFieldsSchema = {
    tabs: {
      company: { hidden_fields: ['sector'] },
      contact: { hidden_fields: [] },
      crm:     { hidden_fields: [] },
    },
    sections: [],
    prospect_types: [],
  }

  it('hides globally-hidden fields regardless of conditional rules', () => {
    expect(isBuiltinFieldVisible(baseSchema, 'company', 'sector', {})).toBe(false)
  })

  it('returns true for fields with neither rule nor global hide', () => {
    expect(isBuiltinFieldVisible(baseSchema, 'company', 'website', {})).toBe(true)
  })

  it('applies per-field conditional rule', () => {
    const schema: CustomFieldsSchema = {
      ...baseSchema,
      tabs: {
        ...baseSchema.tabs,
        company: {
          hidden_fields: [],
          field_rules: {
            website: { field_key: 'type_acteur', values: ['Entreprise'] },
          },
        },
      },
    }
    expect(isBuiltinFieldVisible(schema, 'company', 'website', { type_acteur: 'Entreprise' })).toBe(true)
    expect(isBuiltinFieldVisible(schema, 'company', 'website', { type_acteur: 'B2C' })).toBe(false)
    // No discriminator value yet → hidden (the expected onboarding UX).
    expect(isBuiltinFieldVisible(schema, 'company', 'website', {})).toBe(false)
  })
})

describe('discriminatorCandidates', () => {
  it('only returns select / multiselect rubrics', () => {
    const schema: CustomFieldsSchema = {
      tabs: { company: { hidden_fields: [] }, contact: { hidden_fields: [] }, crm: { hidden_fields: [] } },
      prospect_types: [],
      sections: [{
        id: 's1', label: 'Section A', tab: 'company', position: 0,
        fields: [
          { id: 'f1', key: 'type_acteur', label: 'Type', type: 'select',  options: ['A', 'B'] },
          { id: 'f2', key: 'tarif',       label: 'Tarif', type: 'number'                       },
          { id: 'f3', key: 'specialites', label: 'Spé',  type: 'multiselect', options: ['X', 'Y'] },
          { id: 'f4', key: 'notes',       label: 'Notes', type: 'text'                         },
        ],
      }],
    }
    const candidates = discriminatorCandidates(schema)
    expect(candidates).toHaveLength(2)
    expect(candidates.map(c => c.key).sort()).toEqual(['specialites', 'type_acteur'])
  })
})
