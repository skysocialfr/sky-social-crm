import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect } from '@/types'

export function useProspect(id: string) {
  return useQuery({
    queryKey: ['prospect', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Prospect
    },
    enabled: !!id,
  })
}
