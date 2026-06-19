import { describe, it, expect } from 'vitest'
import { buildTypes } from './ProspectTypesWizard'

type Drafts = Parameters<typeof buildTypes>[0]

const drafts: Drafts = [
  {
    id: 'd1',
    label: 'Photographe',
    emoji: '📷',
    color: '#db2777',
    fields: [
      { id: 'f1', label: 'Nom', type: 'text', required: true, is_title: false },
      { id: 'f2', label: 'Nom', type: 'text', required: false, is_title: false },
      { id: 'f3', label: '', type: 'text', required: false, is_title: false },
    ],
  },
]

describe('buildTypes', () => {
  it('drops empty fields, makes keys unique and prefixed by the type', () => {
    const [t] = buildTypes(drafts)
    expect(t.fields).toHaveLength(2)
    expect(t.fields.map((f) => f.key)).toEqual(['photographe_nom', 'photographe_nom_2'])
  })

  it('falls back to the first field as title when none is flagged', () => {
    const [t] = buildTypes(drafts)
    expect(t.fields[0].is_title).toBe(true)
    expect(t.fields.filter((f) => f.is_title)).toHaveLength(1)
  })

  it('keeps an explicit title flag', () => {
    const [t] = buildTypes([
      {
        id: 'd2', label: 'Agence', emoji: '🏢', color: '#000',
        fields: [
          { id: 'a', label: 'Secteur', type: 'text', required: false, is_title: false },
          { id: 'b', label: 'Raison sociale', type: 'text', required: true, is_title: true },
        ],
      },
    ])
    const title = t.fields.find((f) => f.is_title)
    expect(title?.label).toBe('Raison sociale')
    expect(t.fields.filter((f) => f.is_title)).toHaveLength(1)
  })
})
