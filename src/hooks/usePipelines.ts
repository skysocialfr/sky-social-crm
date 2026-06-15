import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { DEFAULT_STAGES } from '@/lib/constants'
import type { Pipeline, PipelineStageDef } from '@/types'

const KEY = ['pipelines']

async function fetchPipelines(teamId: string): Promise<Pipeline[]> {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('team_id', teamId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Pipeline[]).map(p => ({
    ...p,
    stages: Array.isArray(p.stages) ? p.stages : [],
  }))
}

export function usePipelines() {
  const { profile } = useTheme()
  const teamId = profile?.team_id ?? null
  return useQuery({
    queryKey: [...KEY, teamId],
    queryFn: () => fetchPipelines(teamId!),
    enabled: !!teamId,
  })
}

// Resolve the active pipeline from an explicit id, else the default,
// else the first one. Falls back to a synthetic pipeline using the
// 8 historic stages if pipelines haven't loaded yet.
export function useActivePipeline(activeId?: string | null): {
  pipeline: Pipeline | null
  stages: PipelineStageDef[]
  isLoading: boolean
} {
  const { data: pipelines = [], isLoading } = usePipelines()

  return useMemo(() => {
    if (pipelines.length === 0) {
      return { pipeline: null, stages: DEFAULT_STAGES, isLoading }
    }
    const explicit = activeId ? pipelines.find(p => p.id === activeId) : null
    const fallback = pipelines.find(p => p.is_default) ?? pipelines[0]
    const pipeline = explicit ?? fallback
    return {
      pipeline,
      stages: pipeline.stages.length > 0 ? pipeline.stages : DEFAULT_STAGES,
      isLoading,
    }
  }, [pipelines, activeId, isLoading])
}

export function useDefaultPipeline(): Pipeline | null {
  const { data: pipelines = [] } = usePipelines()
  return pipelines.find(p => p.is_default) ?? pipelines[0] ?? null
}

// -------------------- Mutations --------------------

export function useCreatePipeline() {
  const qc = useQueryClient()
  const { profile } = useTheme()
  return useMutation({
    mutationFn: async (input: { name: string; stages: PipelineStageDef[] }) => {
      if (!profile?.team_id) throw new Error('Pas d\'équipe active')
      const { data, error } = await supabase
        .from('pipelines')
        .insert({
          team_id: profile.team_id,
          name: input.name,
          stages: input.stages,
          is_default: false,
        })
        .select()
        .single()
      if (error) throw error
      return data as Pipeline
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdatePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; stages?: PipelineStageDef[] }) => {
      const patch: Record<string, unknown> = {}
      if (input.name !== undefined) patch.name = input.name
      if (input.stages !== undefined) patch.stages = input.stages
      const { error } = await supabase
        .from('pipelines')
        .update(patch)
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['prospects'] })
    },
  })
}

// Promote a pipeline to default: clears the existing default first
// (the unique partial index forbids two defaults per team).
export function useSetDefaultPipeline() {
  const qc = useQueryClient()
  const { profile } = useTheme()
  return useMutation({
    mutationFn: async (newDefaultId: string) => {
      if (!profile?.team_id) throw new Error('Pas d\'équipe active')
      const { error: clearErr } = await supabase
        .from('pipelines')
        .update({ is_default: false })
        .eq('team_id', profile.team_id)
        .eq('is_default', true)
      if (clearErr) throw clearErr
      const { error } = await supabase
        .from('pipelines')
        .update({ is_default: true })
        .eq('id', newDefaultId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeletePipeline() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipelines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
