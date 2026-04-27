import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InteractionType } from '@/types'

export interface JournalEntry {
  id: string
  type: InteractionType
  date: string
  summary: string
  outcome: string | null
  next_action: string | null
  created_at: string
  prospect_id: string
  prospect_name: string
  company_name: string
}

export function useJournal() {
  return useQuery({
    queryKey: ['journal'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('interactions')
        .select(
          'id, type, date, summary, outcome, next_action, created_at, prospect_id, prospects(first_name, last_name, company_name)'
        )
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(200)

      if (error) throw error

      return (data ?? []).map((r: any): JournalEntry => ({
        id: r.id,
        type: r.type as InteractionType,
        date: r.date as string,
        summary: r.summary as string,
        outcome: r.outcome as string | null,
        next_action: r.next_action as string | null,
        created_at: r.created_at as string,
        prospect_id: r.prospect_id as string,
        prospect_name: `${r.prospects?.first_name ?? ''} ${r.prospects?.last_name ?? ''}`.trim(),
        company_name: (r.prospects?.company_name as string) ?? '',
      }))
    },
  })
}
