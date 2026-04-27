import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Plan = 'pro' | 'team'

function priceIdFor(plan: Plan): string {
  if (plan === 'team') {
    return Deno.env.get('STRIPE_PRICE_ID_TEAM')!
  }
  // 'pro' — kept under the legacy STRIPE_PRICE_ID name so existing
  // Supabase secrets keep working without renaming.
  return Deno.env.get('STRIPE_PRICE_ID')!
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
    }

    const { return_url, plan = 'pro' } = await req.json() as { return_url: string; plan?: Plan }
    if (plan !== 'pro' && plan !== 'team') {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: CORS })
    }
    const priceId = priceIdFor(plan)
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Missing Stripe price ID for plan ${plan}` }), { status: 500, headers: CORS })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = sub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // Stored on the Checkout Session AND propagated to the resulting
      // subscription so the webhook can map back to the correct plan.
      metadata: { plan, supabase_user_id: user.id },
      subscription_data: {
        metadata: { plan, supabase_user_id: user.id },
      },
      success_url: `${return_url}?checkout=success`,
      cancel_url: `${return_url}?checkout=cancelled`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS })
  }
})
