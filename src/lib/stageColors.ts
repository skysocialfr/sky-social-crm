import { LEGACY_STAGE_TW_CLASSES, DEFAULT_STAGES } from '@/lib/constants'
import type { PipelineStageDef } from '@/types'

const FALLBACK_TW = 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
const FALLBACK_HEX = '#64748b'

// Lookup a stage's hex color from a pipeline's stages list. Falls
// back to the legacy default if the label matches one of the 8
// historic stages, otherwise to neutral slate.
export function stageHex(stages: PipelineStageDef[] | undefined, label: string): string {
  const fromPipeline = stages?.find(s => s.label === label)?.color
  if (fromPipeline) return fromPipeline
  const legacy = DEFAULT_STAGES.find(s => s.label === label)?.color
  return legacy ?? FALLBACK_HEX
}

// Tailwind classes for the badge background — only the 8 legacy
// labels have a curated palette. Custom labels render with the
// stage's hex color injected inline (see StageBadge).
export function stageTwClass(label: string): string {
  return LEGACY_STAGE_TW_CLASSES[label] ?? FALLBACK_TW
}

// True when the label is one of the legacy 8 stages (so we can
// render with a Tailwind palette rather than inline hex).
export function isLegacyStage(label: string): boolean {
  return label in LEGACY_STAGE_TW_CLASSES
}
