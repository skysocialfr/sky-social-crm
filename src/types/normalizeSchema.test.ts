import { describe, it, expect } from 'vitest'
import { normalizeSchema, DEFAULT_CUSTOM_FIELDS_SCHEMA } from './index'

describe('normalizeSchema', () => {
  it('returns the safe default when given null/undefined/garbage', () => {
    expect(normalizeSchema(null)).toEqual(DEFAULT_CUSTOM_FIELDS_SCHEMA)
    expect(normalizeSchema(undefined)).toEqual(DEFAULT_CUSTOM_FIELDS_SCHEMA)
    expect(normalizeSchema(42)).toEqual(DEFAULT_CUSTOM_FIELDS_SCHEMA)
    expect(normalizeSchema('hello')).toEqual(DEFAULT_CUSTOM_FIELDS_SCHEMA)
  })

  it('migrates a pre-tabs schema { sections: [...] } by filling in the tabs config', () => {
    // What rows looked like before 008_custom_fields → tab rework.
    const legacy = {
      sections: [
        { id: 's1', label: 'Marketplace', position: 0, fields: [] },
      ],
    }
    const normalized = normalizeSchema(legacy)
    expect(normalized.tabs).toEqual({
      company: { hidden_fields: [] },
      contact: { hidden_fields: [] },
      crm:     { hidden_fields: [] },
    })
    // The section without an explicit tab should default to 'company'
    // so we don't lose it silently.
    expect(normalized.sections).toHaveLength(1)
    expect(normalized.sections[0].tab).toBe('company')
  })

  it('preserves the section.tab when it is already set to a valid built-in tab', () => {
    const schema = {
      tabs: {
        company: { hidden_fields: ['sector'] },
        contact: { hidden_fields: [] },
        crm:     { label: 'Suivi', hidden_fields: [] },
      },
      sections: [
        { id: 's1', label: 'Performance', tab: 'crm', position: 0, fields: [] },
      ],
    }
    const normalized = normalizeSchema(schema)
    expect(normalized.tabs.company.hidden_fields).toEqual(['sector'])
    expect(normalized.tabs.crm.label).toBe('Suivi')
    expect(normalized.sections[0].tab).toBe('crm')
  })

  it('falls back to company when section.tab is an unknown value', () => {
    const schema = {
      sections: [
        // Could happen if we ever add a 4th tab later and a customer
        // hasn't migrated yet.
        { id: 's1', label: 'Stale', position: 0, fields: [], tab: 'finance' },
      ],
    }
    const normalized = normalizeSchema(schema)
    expect(normalized.sections[0].tab).toBe('company')
  })

  it('defaults position to 0 when missing', () => {
    const schema = {
      sections: [
        { id: 's1', label: 'No pos', fields: [] },
      ],
    }
    const normalized = normalizeSchema(schema)
    expect(normalized.sections[0].position).toBe(0)
  })

  it('keeps empty hidden_fields arrays even when partial tab config is given', () => {
    // Old rows might have only labels set, no hidden_fields key at all.
    const schema = {
      tabs: {
        company: { label: 'Prestataire' },
        contact: {},
        crm:     {},
      },
      sections: [],
    }
    const normalized = normalizeSchema(schema)
    expect(normalized.tabs.company).toEqual({ label: 'Prestataire', hidden_fields: [] })
    expect(normalized.tabs.contact).toEqual({ hidden_fields: [] })
    expect(normalized.tabs.crm).toEqual({ hidden_fields: [] })
  })
})
