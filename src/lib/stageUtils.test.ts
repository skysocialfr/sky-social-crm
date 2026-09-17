import { describe, it, expect } from 'vitest'
import {
  groupByStage,
  toEditableStages,
  stripEditableStages,
  computeStageRenames,
  renamesAreChained,
} from './stageUtils'

const STAGES = [
  { label: 'Identifié', color: '#94a3b8' },
  { label: 'RDV fixé', color: '#8b5cf6' },
  { label: 'Gagné', color: '#10b981' },
]

describe('groupByStage', () => {
  it('buckets items under their stage and keeps empty stages', () => {
    const { byStage, orphans } = groupByStage(
      [{ id: 1, stage: 'Identifié' }, { id: 2, stage: 'Gagné' }, { id: 3, stage: 'Identifié' }],
      STAGES,
    )
    expect(byStage['Identifié'].map((p) => p.id)).toEqual([1, 3])
    expect(byStage['RDV fixé']).toEqual([])
    expect(byStage['Gagné'].map((p) => p.id)).toEqual([2])
    expect(orphans).toEqual([])
  })

  // The bug behind "13 prospects on the dashboard, none on the Prospects
  // page": the Kanban used to drop anything whose stage wasn't a column.
  it('never drops an item whose stage is unknown to the pipeline', () => {
    const items = [
      { id: 1, stage: 'Premier contact' },
      { id: 2, stage: 'Identifié' },
      { id: 3, stage: 'Premier contact' },
      { id: 4, stage: 'À rappeler' },
    ]
    const { byStage, orphans } = groupByStage(items, STAGES)

    const placed = Object.values(byStage).flat().length + orphans.flatMap((o) => o.items).length
    expect(placed).toBe(items.length)
    expect(orphans).toEqual([
      { label: 'Premier contact', items: [items[0], items[2]] },
      { label: 'À rappeler', items: [items[3]] },
    ])
  })

  it('treats labels as exact strings (case and accents matter, as in the DB)', () => {
    const { orphans } = groupByStage([{ stage: 'gagné' }], STAGES)
    expect(orphans.map((o) => o.label)).toEqual(['gagné'])
  })
})

describe('computeStageRenames', () => {
  it('returns nothing when labels are untouched, even if reordered or recoloured', () => {
    const edited = toEditableStages(STAGES)
    ;[edited[0], edited[2]] = [edited[2], edited[0]]
    edited[1] = { ...edited[1], color: '#000000' }
    expect(computeStageRenames(edited)).toEqual([])
  })

  it('detects a rename by identity, not by position', () => {
    const edited = toEditableStages(STAGES)
    edited[1] = { ...edited[1], label: '  Rendez-vous pris ' }
    ;[edited[0], edited[1]] = [edited[1], edited[0]]
    expect(computeStageRenames(edited)).toEqual([{ from: 'RDV fixé', to: 'Rendez-vous pris' }])
  })

  it('ignores added and removed stages', () => {
    const edited = [...toEditableStages(STAGES).slice(1), { label: 'Nouvelle étape', color: '#fff' }]
    expect(computeStageRenames(edited)).toEqual([])
  })
})

describe('renamesAreChained', () => {
  it('is false for independent renames', () => {
    expect(renamesAreChained([{ from: 'A', to: 'X' }, { from: 'B', to: 'Y' }])).toBe(false)
  })

  it('is true for a swap or a chain, which would merge stages if applied in sequence', () => {
    expect(renamesAreChained([{ from: 'A', to: 'B' }, { from: 'B', to: 'A' }])).toBe(true)
    expect(renamesAreChained([{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }])).toBe(true)
  })
})

describe('stripEditableStages', () => {
  it('removes the editor-only field before the stages are saved', () => {
    expect(stripEditableStages(toEditableStages(STAGES))).toEqual(STAGES)
  })
})
