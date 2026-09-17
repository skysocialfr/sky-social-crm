import type { PipelineStageDef } from '@/types'

// A prospect stores its stage as the LABEL string of one of its
// pipeline's stages (see types/index.ts). Nothing at the DB level keeps
// the two in sync, so a prospect can end up holding a label its pipeline
// doesn't define: a stage renamed or removed in Settings, or a CSV import
// with its own "Étape" column. These helpers make sure such prospects
// are never silently dropped from a view, and that renames follow through.

export interface OrphanStage<T> {
  label: string
  items: T[]
}

/**
 * Buckets items by stage. Items whose stage isn't one of `stages` are
 * returned as `orphans` (grouped by their label, first-seen order)
 * instead of being discarded — the Kanban renders them as extra columns.
 */
export function groupByStage<T extends { stage: string }>(
  items: T[],
  stages: PipelineStageDef[],
): { byStage: Record<string, T[]>; orphans: OrphanStage<T>[] } {
  const byStage: Record<string, T[]> = {}
  for (const s of stages) byStage[s.label] = []

  const orphanIndex = new Map<string, OrphanStage<T>>()
  for (const item of items) {
    const bucket = byStage[item.stage]
    if (bucket) {
      bucket.push(item)
      continue
    }
    let orphan = orphanIndex.get(item.stage)
    if (!orphan) {
      orphan = { label: item.stage, items: [] }
      orphanIndex.set(item.stage, orphan)
    }
    orphan.items.push(item)
  }
  return { byStage, orphans: [...orphanIndex.values()] }
}

// ---------------------------------------------------------------
// Stage renames (Settings → Leads → Éditer les étapes)
// ---------------------------------------------------------------

/** A stage being edited, remembering the label it was loaded with. */
export type EditableStage = PipelineStageDef & { _orig?: string }

export interface StageRename {
  from: string
  to: string
}

export function toEditableStages(stages: PipelineStageDef[]): EditableStage[] {
  return stages.map((s) => ({ ...s, _orig: s.label }))
}

export function stripEditableStages(stages: EditableStage[]): PipelineStageDef[] {
  return stages.map(({ _orig: _discarded, ...rest }) => rest)
}

/**
 * Stages that existed before the edit and come out of it with a
 * different label. Newly added stages (no `_orig`) and removed stages
 * are not renames. Reordering doesn't matter — identity is `_orig`.
 */
export function computeStageRenames(edited: EditableStage[]): StageRename[] {
  const renames: StageRename[] = []
  for (const s of edited) {
    const to = s.label.trim()
    if (!s._orig || !to || s._orig === to) continue
    renames.push({ from: s._orig, to })
  }
  return renames
}

/**
 * True when one rename's target is another rename's source (A→B while
 * B→C, or a swap). Applying those one by one would merge two stages, so
 * the caller must go through temporary labels.
 */
export function renamesAreChained(renames: StageRename[]): boolean {
  const sources = new Set(renames.map((r) => r.from))
  return renames.some((r) => sources.has(r.to))
}
