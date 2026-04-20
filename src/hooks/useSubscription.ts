import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface SubscriptionData {
  status: 'free' | 'active' | 'cancelled' | 'past_due'
  prospect_limit: number
  current_period_end: string | null
  stripe_customer_id: string | null
}

export const FREE_PLAN: SubscriptionData = {
  status: 'free',
  prospect_limit: 25,
  current_period_end: null,
  stripe_customer_id: null,
}

export function useSubscription() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, prospect_limit, current_period_end, stripe_customer_id')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return (data as SubscriptionData | null) ?? FREE_PLAN
    },
    enabled: !!user,
  })
}

export async function createCheckoutSession(returnUrl: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ return_url: returnUrl }),
    }
  )
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Erreur lors de la création du paiement')
  }
  const data = await res.json()
  return data.url as string
}
