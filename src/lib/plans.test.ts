import { describe, it, expect } from 'vitest'
import { planForPriceId, resolveSubscriptionUpdate, PLAN_LIMITS } from './plans'

// These tests document the post-audit security contract for the
// Stripe webhook: the plan a customer gets MUST be derived from the
// actual price ID they are billed against, never from a metadata
// hint, so a tampered checkout can't claim Team while paying Pro.

describe('planForPriceId', () => {
  const map = { proPriceId: 'price_pro_live', teamPriceId: 'price_team_live' }

  it('returns "team" when the price id matches the Team product', () => {
    expect(planForPriceId('price_team_live', map)).toBe('team')
  })

  it('returns "pro" when the price id matches the Pro product', () => {
    expect(planForPriceId('price_pro_live', map)).toBe('pro')
  })

  it('falls back to "pro" for an unknown price id', () => {
    // Defense in depth: misconfigured price IDs in env should not
    // silently downgrade a paying customer to free.
    expect(planForPriceId('price_some_other_thing', map)).toBe('pro')
  })

  it('falls back to "pro" when no price id is provided', () => {
    expect(planForPriceId(null, map)).toBe('pro')
    expect(planForPriceId(undefined, map)).toBe('pro')
  })

  it('ignores team match when the team price id env var is missing', () => {
    // If STRIPE_PRICE_ID_TEAM isn't set, "team" must never be returned
    // — that would let any random price be classified as Team.
    expect(planForPriceId('price_team_live', { proPriceId: 'price_pro_live' })).toBe('pro')
  })
})

describe('resolveSubscriptionUpdate', () => {
  const priceMap = { proPriceId: 'price_pro_live', teamPriceId: 'price_team_live' }

  it('keeps the plan derived from the price id on active subscriptions', () => {
    const result = resolveSubscriptionUpdate({
      stripeStatus: 'active',
      priceId: 'price_team_live',
      priceMap,
    })
    expect(result).toEqual({ plan: 'team', status: 'active', prospect_limit: PLAN_LIMITS.team })
  })

  it('forces plan back to free when the subscription becomes past_due', () => {
    // The whole point of the past_due banner: the user shouldn't keep
    // their premium quota while the payment is failing.
    const result = resolveSubscriptionUpdate({
      stripeStatus: 'past_due',
      priceId: 'price_team_live',
      priceMap,
    })
    expect(result).toEqual({ plan: 'free', status: 'past_due', prospect_limit: PLAN_LIMITS.free })
  })

  it('clears plan to free when the subscription is cancelled', () => {
    const result = resolveSubscriptionUpdate({
      stripeStatus: 'cancelled',
      priceId: 'price_pro_live',
      priceMap,
    })
    expect(result.plan).toBe('free')
    expect(result.status).toBe('cancelled')
    expect(result.prospect_limit).toBe(PLAN_LIMITS.free)
  })

  it('treats any other Stripe status as cancelled', () => {
    // Stripe has incomplete / incomplete_expired / unpaid / paused etc.
    // — none of them entitle the customer to premium quota.
    for (const status of ['incomplete', 'unpaid', 'paused', 'whatever']) {
      const result = resolveSubscriptionUpdate({
        stripeStatus: status,
        priceId: 'price_pro_live',
        priceMap,
      })
      expect(result.plan, `status=${status}`).toBe('free')
      expect(result.status, `status=${status}`).toBe('cancelled')
    }
  })
})
