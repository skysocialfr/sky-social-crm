import { describe, it, expect } from 'vitest'
import {
  prospectInScope,
  prospectVisible,
  prospectEditable,
  listDelegableFields,
} from './scopeMatcher'
import type {
  CustomFieldsSchema,
  Prospect,
  TeamMember,
} from '../types'

// These tests mirror the SQL function prospect_in_user_scope() from
// migration 011_team_rls.sql. The two implementations must stay in lock-
// step — a divergence would mean the UI grays out a button the server
// would have accepted (annoying) or, worse, surfaces a record the
// server will refuse to update (silent failure).

const ALICE = 'alice-uid'
const BOB   = 'bob-uid'
const TEAM  = 'team-1'

function mkMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    team_id: TEAM,
    user_id: BOB,
    role: 'member',
    visibility_mode: 'scope_only',
    scopes: {},
    joined_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

function mkProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'p1',
    user_id: ALICE,
    team_id: TEAM,
    assigned_to: ALICE,
    company_name: 'Acme',
    sector: null,
    company_size: null,
    website: null,
    linkedin_url: null,
    instagram_url: null,
    google_maps_url: null,
    first_name: 'John',
    last_name: 'Doe',
    title: null,
    email: null,
    phone: null,
    city: null,
    country: 'France',
    priority: 'Tiède',
    stage: 'Identifié',
    pipeline_id: 'pl1',
    channel: 'LinkedIn',
    services_interested: [],
    deal_value: null,
    currency: 'EUR',
    next_followup_date: null,
    notes: null,
    custom_data: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('prospectInScope', () => {
  it('returns false when there is no membership', () => {
    expect(prospectInScope(null, mkProspect(), BOB)).toBe(false)
  })

  it('lets the team owner see anything', () => {
    const owner = mkMember({ role: 'owner', user_id: ALICE })
    expect(prospectInScope(owner, mkProspect(), ALICE)).toBe(true)
  })

  it('lets a member see prospects they created even with an unrelated scope', () => {
    const member = mkMember({ scopes: { zone: ['paris'] } })
    const own = mkProspect({ user_id: BOB, custom_data: { zone: 'lyon' } })
    expect(prospectInScope(member, own, BOB)).toBe(true)
  })

  it('lets a member see prospects assigned to them', () => {
    const member = mkMember({ scopes: { zone: ['paris'] } })
    const assigned = mkProspect({ user_id: ALICE, assigned_to: BOB, custom_data: { zone: 'lyon' } })
    expect(prospectInScope(member, assigned, BOB)).toBe(true)
  })

  it('returns true when scopes is empty (no restriction)', () => {
    const member = mkMember({ scopes: {} })
    expect(prospectInScope(member, mkProspect(), BOB)).toBe(true)
  })

  it('matches a single scope key against the prospect custom_data', () => {
    const member = mkMember({ scopes: { zone: ['paris', 'lyon'] } })
    expect(prospectInScope(member, mkProspect({ custom_data: { zone: 'paris' } }), BOB)).toBe(true)
    expect(prospectInScope(member, mkProspect({ custom_data: { zone: 'marseille' } }), BOB)).toBe(false)
  })

  it('requires ALL scope keys to match (AND semantics)', () => {
    const member = mkMember({ scopes: { zone: ['paris'], specialite: ['mariage'] } })
    expect(prospectInScope(member, mkProspect({ custom_data: { zone: 'paris', specialite: 'mariage' } }), BOB))
      .toBe(true)
    expect(prospectInScope(member, mkProspect({ custom_data: { zone: 'paris', specialite: 'corporate' } }), BOB))
      .toBe(false)
    expect(prospectInScope(member, mkProspect({ custom_data: { zone: 'lyon', specialite: 'mariage' } }), BOB))
      .toBe(false)
  })

  it('returns false when the prospect is missing the scoped field entirely', () => {
    // Mirrors the SQL: "if v_actual is null then return false".
    const member = mkMember({ scopes: { zone: ['paris'] } })
    expect(prospectInScope(member, mkProspect({ custom_data: {} }), BOB)).toBe(false)
  })

  it('matches array values (multiselect) against allowed scope values', () => {
    const member = mkMember({ scopes: { tags: ['premium'] } })
    expect(prospectInScope(member, mkProspect({ custom_data: { tags: ['premium', 'vip'] } }), BOB))
      .toBe(true)
    expect(prospectInScope(member, mkProspect({ custom_data: { tags: ['standard'] } }), BOB))
      .toBe(false)
  })
})

describe('prospectVisible', () => {
  it('grants visibility when read_all is set, regardless of scope', () => {
    const member = mkMember({ visibility_mode: 'read_all', scopes: { zone: ['paris'] } })
    const out_of_scope = mkProspect({ user_id: ALICE, custom_data: { zone: 'marseille' } })
    expect(prospectVisible(member, out_of_scope, BOB)).toBe(true)
  })

  it('falls back to scope match when visibility_mode is scope_only', () => {
    const member = mkMember({ visibility_mode: 'scope_only', scopes: { zone: ['paris'] } })
    const out_of_scope = mkProspect({ user_id: ALICE, custom_data: { zone: 'marseille' } })
    expect(prospectVisible(member, out_of_scope, BOB)).toBe(false)
  })
})

describe('prospectEditable', () => {
  it('read_all does NOT grant write access outside scope', () => {
    const member = mkMember({ visibility_mode: 'read_all', scopes: { zone: ['paris'] } })
    const out_of_scope = mkProspect({ user_id: ALICE, custom_data: { zone: 'marseille' } })
    expect(prospectEditable(member, out_of_scope, BOB)).toBe(false)
  })

  it('grants write when prospect matches scope', () => {
    const member = mkMember({ visibility_mode: 'read_all', scopes: { zone: ['paris'] } })
    const in_scope = mkProspect({ user_id: ALICE, custom_data: { zone: 'paris' } })
    expect(prospectEditable(member, in_scope, BOB)).toBe(true)
  })
})

describe('listDelegableFields', () => {
  it('returns only select-type fields flagged as delegable with non-empty options', () => {
    const schema: CustomFieldsSchema = {
      tabs: {
        company: { hidden_fields: [] },
        contact: { hidden_fields: [] },
        crm: { hidden_fields: [] },
      },
      sections: [{
        id: 's1', label: 'Photo', tab: 'company', position: 0, fields: [
          { id: 'f1', key: 'zone',   label: 'Zone',       type: 'select', options: ['paris', 'lyon'], delegable: true },
          { id: 'f2', key: 'tags',   label: 'Tags',       type: 'multiselect', options: ['a'], delegable: true }, // wrong type
          { id: 'f3', key: 'budget', label: 'Budget',     type: 'select', options: ['low'],   delegable: false },  // not flagged
          { id: 'f4', key: 'empty',  label: 'Empty',      type: 'select', options: [],         delegable: true },  // no options
        ],
      }],
    }
    const result = listDelegableFields(schema)
    expect(result).toEqual([
      { key: 'zone', label: 'Zone', options: ['paris', 'lyon'], sectionLabel: 'Photo' },
    ])
  })

  it('returns an empty list for a null schema', () => {
    expect(listDelegableFields(null)).toEqual([])
  })
})
