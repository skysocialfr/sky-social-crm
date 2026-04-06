import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Interaction, InteractionType } from '@/types'

export function useInteractions(prospectId: string) {
  return useQuery({
    queryKey: ['interactions', prospectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Interaction[]
    },
    enabled: !!prospectId,
  })
}

export function useCreateInteraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      prospect_id: string
      type: InteractionType
      date: string
      summary: string
      outcome?: string
      next_action?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('interactions')
        .insert({ ...payload, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Interaction
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['interactions', vars.prospect_id] })
    },
  })
}

export function useDeleteInteraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, prospectId }: { id: string; prospectId: string }) => {
      const { error } = await supabase.from('interactions').delete().eq('id', id)
      if (error) throw error
      return prospectId
    },
    onSuccess: (prospectId) => {
      qc.invalidateQueries({ queryKey: ['interactions', prospectId] })
    },
  })
}
