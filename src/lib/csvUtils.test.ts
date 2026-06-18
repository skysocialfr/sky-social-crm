import { describe, it, expect } from 'vitest'
import { autoDetectMapping, computeResult, getValidRows } from './csvUtils'
import { PROSPECT_TYPE_KEY } from '@/types'
import type { ProspectType } from '@/types'

const TYPES: ProspectType[] = [
  {
    id: 'photographe', label: 'Photographe', position: 0,
    fields: [
      { id: 'f1', key: 'tarif', label: 'Tarif', type: 'number', isCurrency: true },
      { id: 'f2', key: 'specialites', label: 'Spécialités', type: 'multiselect', options: ['Mariage', 'Portrait'] },
    ],
  },
  { id: 'agence_com', label: 'Agence de communication', position: 1, fields: [] },
]

describe('autoDetectMapping', () => {
  it('detects a type column by common header names', () => {
    const m = autoDetectMapping(['Entreprise', 'Type de prospect', 'Prénom'])
    expect(m['Type de prospect']).toBe('__type')
    expect(m['Entreprise']).toBe('company_name')
  })
})

describe('computeResult — prospect types', () => {
  const headers = ['Entreprise', 'Prénom', 'Nom', 'Type', 'Tarif', 'Spécialités']
  const rawRows = [
    { Entreprise: 'Studio A', Prénom: 'Léa', Nom: 'Martin', Type: 'Photographe', Tarif: '1 200 €', Spécialités: 'Mariage; Portrait' },
    { Entreprise: 'Agence B', Prénom: 'Tom', Nom: 'Durand', Type: 'agence de communication', Tarif: '', Spécialités: '' },
    { Entreprise: 'Studio C', Prénom: 'Iris', Nom: 'Roy', Type: 'Inconnu', Tarif: '900', Spécialités: '' },
  ]

  it('resolves the type column to a type id (case-insensitive) and parses custom fields', () => {
    const mapping = autoDetectMapping(headers)
    mapping['Tarif'] = 'custom:tarif'
    mapping['Spécialités'] = 'custom:specialites'
    const result = computeResult(headers, rawRows, mapping, { prospectTypes: TYPES })

    const r0 = result.rows[0].data
    expect(r0.custom_data?.[PROSPECT_TYPE_KEY]).toBe('photographe')
    expect(r0.custom_data?.tarif).toBe(1200)
    expect(r0.custom_data?.specialites).toEqual(['Mariage', 'Portrait'])

    expect(result.rows[1].data.custom_data?.[PROSPECT_TYPE_KEY]).toBe('agence_com')

    // Unknown type → flagged as an error, row excluded from valid rows.
    expect(result.rows[2].errors.some(e => e.includes('Type inconnu'))).toBe(true)
  })

  it('applies a default type to every row when no type column is mapped', () => {
    const mapping = autoDetectMapping(['Entreprise', 'Prénom', 'Nom'])
    const rows = [{ Entreprise: 'X', Prénom: 'A', Nom: 'B' }]
    const result = computeResult(['Entreprise', 'Prénom', 'Nom'], rows, mapping, {
      prospectTypes: TYPES,
      defaultTypeId: 'photographe',
    })
    expect(result.rows[0].data.custom_data?.[PROSPECT_TYPE_KEY]).toBe('photographe')
    expect(getValidRows(result.rows)).toHaveLength(1)
  })
})
