import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth()
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['is_admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) return false
      return data as boolean
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  })
  return { isAdmin: data ?? false, isLoading: authLoading || queryLoading }
}
