import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dateUtils'
import type { Prospect } from '@/types'

export function useRelances() {
  return useQuery({
    queryKey: ['relances'],
    queryFn: async () => {
      const today = todayISO()
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .not('next_followup_date', 'is', null)
        .lte('next_followup_date', today)
        .not('stage', 'in', '("Gagné","Perdu")')
        .order('next_followup_date', { ascending: true })
      if (error) throw error
      return data as Prospect[]
    },
  })
}
