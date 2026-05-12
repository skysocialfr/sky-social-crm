// Mirror of the plan-resolution logic that lives in the Deno edge
// function (supabase/functions/stripe-webhook/index.ts). The Deno
// runtime can't be imported from Vitest, so we keep a parallel
// implementation here and unit-test it. Any change in webhook
// resolution rules must be applied in BOTH files until we share a
// single source of truth via a Deno-compatible package.

export type Plan = 'free' | 'pro' | 'team'

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 25,
  pro:  500,
  team: 9999,
}

export interface PriceIdMap {
  proPriceId?: string | null
  teamPriceId?: string | null
}

// Given the price ID a customer is subscribed to, returns the plan
// that should be applied. Falls back to 'pro' for any unknown price
// (matches the edge function's behavior — we never want to silently
// downgrade a paying customer because of a config typo).
export function planForPriceId(priceId: string | null | undefined, map: PriceIdMap): Plan {
  if (!priceId) return 'pro'
  if (map.teamPriceId && priceId === map.teamPriceId) return 'team'
  if (map.proPriceId  && priceId === map.proPriceId)  return 'pro'
  return 'pro'
}

// Resolves the (plan, status, prospect_limit) tuple from a Stripe
// subscription state. Pulled out so we can test that:
//   - past_due downgrades prospect_limit to the free tier
//   - cancelled clears plan to free
//   - active keeps the plan derived from price ID
export function resolveSubscriptionUpdate(input: {
  stripeStatus: string
  priceId: string | null | undefined
  priceMap: PriceIdMap
}): { plan: Plan; status: 'active' | 'past_due' | 'cancelled'; prospect_limit: number } {
  const derivedPlan = planForPriceId(input.priceId, input.priceMap)
  const status: 'active' | 'past_due' | 'cancelled' =
    input.stripeStatus === 'active'   ? 'active'
    : input.stripeStatus === 'past_due' ? 'past_due'
    :                                     'cancelled'
  const plan: Plan = status === 'active' ? derivedPlan : 'free'
  return { plan, status, prospect_limit: PLAN_LIMITS[plan] }
}
