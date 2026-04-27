import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface RecentActivity {
  id: string
  type: string
  date: string
  summary: string
  outcome: string | null
  created_at: string
  prospect_id: string
  prospect_name: string
  company_name: string
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('interactions')
        .select(
          'id, type, date, summary, outcome, created_at, prospect_id, prospects(first_name, last_name, company_name)'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data ?? []).map((r: any) => ({
        id: r.id,
        type: r.type as string,
        date: r.date as string,
        summary: r.summary as string,
        outcome: r.outcome as string | null,
        created_at: r.created_at as string,
        prospect_id: r.prospect_id as string,
        prospect_name: `${r.prospects?.first_name ?? ''} ${r.prospects?.last_name ?? ''}`.trim(),
        company_name: (r.prospects?.company_name as string) ?? '',
      })) as RecentActivity[]
    },
  })
}
