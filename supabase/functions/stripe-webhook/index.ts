import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

type Plan = 'free' | 'pro' | 'team'

const PLAN_LIMITS: Record<Plan, number> = {
  free: 25,
  pro:  500,
  team: 9999,
}

function planForPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return 'pro'
  if (priceId === Deno.env.get('STRIPE_PRICE_ID_TEAM')) return 'team'
  if (priceId === Deno.env.get('STRIPE_PRICE_ID'))      return 'pro'
  return 'pro'
}

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
  // Deno's WebCrypto is async-only, so signature verification has to use
  // constructEventAsync + the SubtleCrypto provider. The sync version
  // throws "SubtleCryptoProvider cannot be used in a synchronous context."
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return new Response(`Webhook Error: ${err}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      if (session.mode !== 'subscription') break
      const customerId = session.customer as string

      // Resolve plan: prefer the metadata we set ourselves, fall back
      // to looking up the line item's price.
      let plan: Plan = (session.metadata?.plan as Plan) || 'pro'
      if (plan !== 'pro' && plan !== 'team') {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        plan = planForPriceId(sub.items.data[0]?.price?.id)
      }

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan,
          prospect_limit: PLAN_LIMITS[plan],
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      // Plan can change here (e.g. user upgrades from Pro to Team).
      const plan: Plan = (sub.metadata?.plan as Plan) && ['pro', 'team'].includes(sub.metadata.plan as string)
        ? sub.metadata.plan as Plan
        : planForPriceId(sub.items.data[0]?.price?.id)

      const status: 'active' | 'past_due' | 'cancelled' =
        sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : 'cancelled'

      await supabase
        .from('subscriptions')
        .update({
          status,
          plan: status === 'active' ? plan : 'free',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          prospect_limit: status === 'active' ? PLAN_LIMITS[plan] : PLAN_LIMITS.free,
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', plan: 'free', prospect_limit: PLAN_LIMITS.free })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
