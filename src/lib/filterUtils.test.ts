import { describe, it, expect } from 'vitest'
import { evaluateConditions } from './filterUtils'
import type { Prospect } from '@/types'

// Minimal Prospect factory — only the fields filters touch matter.
// Anything else gets a safe default so we don't pollute every test
// with the full type.
function p(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'id',
    user_id: 'u',
    team_id: 't',
    assigned_to: 'u',
    company_name: '',
    sector: null,
    company_size: null,
    website: null,
    linkedin_url: null,
    instagram_url: null,
    google_maps_url: null,
    first_name: '',
    last_name: '',
    title: null,
    email: null,
    phone: null,
    city: null,
    country: 'France',
    priority: 'Froid',
    stage: 'Identifié',
    channel: 'LinkedIn',
    services_interested: [],
    deal_value: null,
    currency: 'EUR',
    next_followup_date: null,
    notes: null,
    custom_data: {},
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('evaluateConditions', () => {
  describe('text operators', () => {
    it('contains is case-insensitive', () => {
      const prospect = p({ company_name: 'Acme SARL' })
      expect(evaluateConditions(prospect, [{ field: 'company_name', operator: 'contains', value: 'acme' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'company_name', operator: 'contains', value: 'ACME' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'company_name', operator: 'contains', value: 'globex' }])).toBe(false)
    })

    it('not_contains inverts contains', () => {
      const prospect = p({ sector: 'Restaurant' })
      expect(evaluateConditions(prospect, [{ field: 'sector', operator: 'not_contains', value: 'tech' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'sector', operator: 'not_contains', value: 'rest' }])).toBe(false)
    })

    it('equals requires an exact match (case-insensitive)', () => {
      const prospect = p({ stage: 'RDV fixé' })
      expect(evaluateConditions(prospect, [{ field: 'stage', operator: 'equals', value: 'rdv fixé' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'stage', operator: 'equals', value: 'rdv' }])).toBe(false)
    })

    it('is_empty treats null AND empty string as empty', () => {
      expect(evaluateConditions(p({ email: null }), [{ field: 'email', operator: 'is_empty', value: '' }])).toBe(true)
      expect(evaluateConditions(p({ email: '' }), [{ field: 'email', operator: 'is_empty', value: '' }])).toBe(true)
      expect(evaluateConditions(p({ email: 'x@y.z' }), [{ field: 'email', operator: 'is_empty', value: '' }])).toBe(false)
    })

    it('is_not_empty is the strict opposite of is_empty', () => {
      expect(evaluateConditions(p({ email: null }), [{ field: 'email', operator: 'is_not_empty', value: '' }])).toBe(false)
      expect(evaluateConditions(p({ email: 'x@y.z' }), [{ field: 'email', operator: 'is_not_empty', value: '' }])).toBe(true)
    })
  })

  describe('number operators', () => {
    it('eq/gt/gte/lt/lte coerce both sides to float', () => {
      const prospect = p({ deal_value: 500 })
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'eq',  value: '500' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'gt',  value: '499' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'gte', value: '500' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'lt',  value: '501' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'lte', value: '500' }])).toBe(true)
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'gt',  value: '500' }])).toBe(false)
    })

    it('returns false when a numeric comparison is run against null (NaN trap)', () => {
      const prospect = p({ deal_value: null })
      // parseFloat('') is NaN — every comparison against NaN returns false,
      // which is the right behavior here: a missing deal_value isn't > 100.
      expect(evaluateConditions(prospect, [{ field: 'deal_value', operator: 'gt', value: '100' }])).toBe(false)
    })
  })

  describe('multiple conditions', () => {
    it('combines conditions with AND semantics', () => {
      const prospect = p({ company_name: 'Acme', stage: 'RDV fixé', deal_value: 1500 })
      expect(
        evaluateConditions(prospect, [
          { field: 'company_name', operator: 'contains', value: 'Ac' },
          { field: 'stage',        operator: 'equals',   value: 'RDV fixé' },
          { field: 'deal_value',   operator: 'gt',       value: '1000' },
        ])
      ).toBe(true)

      // Any one failing condition fails the whole set.
      expect(
        evaluateConditions(prospect, [
          { field: 'company_name', operator: 'contains', value: 'Ac' },
          { field: 'stage',        operator: 'equals',   value: 'Perdu' },
        ])
      ).toBe(false)
    })

    it('returns true when no conditions are given (empty filter = pass-all)', () => {
      expect(evaluateConditions(p({}), [])).toBe(true)
    })
  })

  it('unknown operators pass the condition through (forward-compat fallback)', () => {
    // If we ever add a new operator and forget to roll out the engine,
    // the safer behavior is to not exclude prospects from results.
    expect(evaluateConditions(p({ company_name: 'X' }), [
      { field: 'company_name', operator: 'unknown_op', value: 'anything' },
    ])).toBe(true)
  })
})
