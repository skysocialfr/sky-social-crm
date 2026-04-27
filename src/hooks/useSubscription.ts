import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export type SubscriptionPlan = 'free' | 'pro' | 'team'

export interface SubscriptionData {
  status: 'free' | 'active' | 'cancelled' | 'past_due'
  plan: SubscriptionPlan
  prospect_limit: number
  current_period_end: string | null
  stripe_customer_id: string | null
}

export const FREE_PLAN: SubscriptionData = {
  status: 'free',
  plan: 'free',
  prospect_limit: 25,
  current_period_end: null,
  stripe_customer_id: null,
}

export const PLAN_DETAILS: Record<SubscriptionPlan, {
  label: string
  price: string
  prospectLimit: number
  features: string[]
}> = {
  free: {
    label: 'Gratuit',
    price: '0€',
    prospectLimit: 25,
    features: ['25 prospects', 'Pipeline visuel', 'Relances manuelles'],
  },
  pro: {
    label: 'Pro',
    price: '9€/mois',
    prospectLimit: 500,
    features: ['500 prospects', 'Import CSV', 'Export données', 'Email direct prospect', 'Statistiques avancées'],
  },
  team: {
    label: 'Team',
    price: '29€/mois',
    prospectLimit: 9999,
    features: ['Prospects illimités', 'Tout ce qui est Pro', 'Multi-utilisateurs (à venir)', 'Support prioritaire'],
  },
}

export function useSubscription() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan, prospect_limit, current_period_end, stripe_customer_id')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return (data as SubscriptionData | null) ?? FREE_PLAN
    },
    enabled: !!user,
  })
}

export async function createCheckoutSession(returnUrl: string, plan: 'pro' | 'team' = 'pro'): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ return_url: returnUrl, plan }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    let detail = text
    try { detail = JSON.parse(text).error ?? text } catch { /* keep raw text */ }
    throw new Error(`HTTP ${res.status} — ${detail || 'Erreur lors de la création du paiement'}`)
  }
  const data = await res.json()
  if (!data.url) throw new Error('Réponse invalide : URL Stripe manquante')
  return data.url as string
}
