import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect, ProspectFormData, PipelineStage } from '@/types'

const KEY = ['prospects']

async function fetchProspects(): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Prospect[]
}

export function useProspects() {
  return useQuery({ queryKey: KEY, queryFn: fetchProspects })
}

export function useCreateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProspectFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: prospect, error } = await supabase
        .from('prospects')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return prospect as Prospect
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProspectFormData> }) => {
      const { data: prospect, error } = await supabase
        .from('prospects')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return prospect as Prospect
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['prospect', id] })
    },
  })
}

export function useDeleteProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prospects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMoveProspect() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: PipelineStage }) => {
      const { error } = await supabase.from('prospects').update({ stage }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: KEY })
      const previous = qc.getQueryData<Prospect[]>(KEY)
      qc.setQueryData<Prospect[]>(KEY, (old) =>
        old?.map((p) => (p.id === id ? { ...p, stage } : p)) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(KEY, context.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
