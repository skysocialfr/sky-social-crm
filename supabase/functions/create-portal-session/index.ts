import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Creates a one-time URL to Stripe's hosted Billing Portal so the customer
// can update their payment method, cancel, switch plans, or download
// invoices — without us building any of that UI.
//
// Requires:
//   - SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//   - STRIPE_SECRET_KEY
//   - The Stripe Customer Portal must be activated once in
//     Stripe Dashboard → Settings → Billing → Customer portal.

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

    const { return_url } = await req.json() as { return_url: string }
    if (!return_url) {
      return new Response(JSON.stringify({ error: 'Missing return_url' }), { status: 400, headers: CORS })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      // Without a Stripe customer there's nothing to manage — the user
      // hasn't started a subscription yet. The UI should hide the button
      // in that case; this guard is defense in depth.
      return new Response(JSON.stringify({ error: 'No Stripe customer for this user' }), { status: 404, headers: CORS })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS })
  }
})
