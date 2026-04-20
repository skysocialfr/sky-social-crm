import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
    }

    const { to, subject, body, prospect_id, prospect_first_name } = await req.json()

    if (!to || !subject || !body || !prospect_id) {
      return new Response(JSON.stringify({ error: 'Paramètres manquants' }), { status: 400, headers: CORS })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@skysocial.fr'

    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configuré' }), { status: 500, headers: CORS })
    }

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        text: body,
      }),
    })

    if (!emailRes.ok) {
      const errData = await emailRes.json()
      return new Response(JSON.stringify({ error: errData.message ?? 'Erreur Resend' }), {
        status: emailRes.status,
        headers: CORS,
      })
    }

    // Log interaction in DB
    await supabase.from('interactions').insert({
      prospect_id,
      user_id: user.id,
      type: 'Email',
      date: new Date().toISOString().split('T')[0],
      summary: `Email envoyé : ${subject}`,
      outcome: 'Email envoyé avec succès',
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS })
  }
})
