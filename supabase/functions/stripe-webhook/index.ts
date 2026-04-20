import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (err) {
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
      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          prospect_limit: 9999,
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const status: string =
        sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : 'cancelled'
      await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          prospect_limit: status === 'active' ? 9999 : 25,
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', prospect_limit: 25 })
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
