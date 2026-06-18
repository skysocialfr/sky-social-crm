import { describe, it, expect } from 'vitest'
import { getTitleValue, prospectDisplayName, resolveProspectType } from './prospectTypes'
import { PROSPECT_TYPE_KEY } from '@/types'
import type { ProspectType } from '@/types'

const photographe: ProspectType = {
  id: 'photographe', label: 'Photographe', position: 0,
  fields: [
    { id: 'tarif', key: 'tarif', label: 'Tarif', type: 'number' },
    { id: 'nom', key: 'nom', label: 'Nom', type: 'text', is_title: true },
    { id: 'site', key: 'site', label: 'Site', type: 'url' },
  ],
}

const schema = { prospect_types: [photographe] }

describe('getTitleValue', () => {
  it('uses the field flagged is_title', () => {
    expect(getTitleValue(photographe, { nom: 'Studio A', site: 'x.fr' })).toBe('Studio A')
  })

  it('falls back to the first text-like field when no title value', () => {
    expect(getTitleValue(photographe, { site: 'studio.fr' })).toBe('studio.fr')
  })

  it('returns empty string when nothing usable', () => {
    expect(getTitleValue(photographe, {})).toBe('')
    expect(getTitleValue(photographe, { tarif: 1200 })).toBe('1200')
  })
})

describe('prospectDisplayName', () => {
  const base = { first_name: '', last_name: '', custom_data: {} as Record<string, any> }

  it('prefers company_name when set', () => {
    expect(prospectDisplayName({ ...base, company_name: 'Acme' }, schema)).toBe('Acme')
  })

  it('derives from the type title field when company_name is empty', () => {
    expect(
      prospectDisplayName(
        { ...base, company_name: '', custom_data: { [PROSPECT_TYPE_KEY]: 'photographe', nom: 'Studio B' } },
        schema,
      ),
    ).toBe('Studio B')
  })

  it('falls back to the contact name then a placeholder', () => {
    expect(prospectDisplayName({ ...base, company_name: '', first_name: 'Léa', last_name: 'M' }, schema)).toBe('Léa M')
    expect(prospectDisplayName({ ...base, company_name: '' }, schema)).toBe('Sans nom')
  })
})

describe('resolveProspectType', () => {
  it('resolves a type from custom_data', () => {
    expect(resolveProspectType({ [PROSPECT_TYPE_KEY]: 'photographe' }, schema)?.label).toBe('Photographe')
    expect(resolveProspectType({}, schema)).toBeUndefined()
  })
})
