import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AcceptBody {
  token: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)
    if (!user.email) return json({ error: 'Authenticated account has no email' }, 400)

    const { token } = (await req.json()) as AcceptBody
    if (!token) return json({ error: 'Missing token' }, 400)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Look up the invite row.
    const { data: invite, error: lookupErr } = await supabaseAdmin
      .from('team_invites')
      .select('id, team_id, email, visibility_mode, scopes, status, expires_at')
      .eq('token', token)
      .maybeSingle()
    if (lookupErr) return json({ error: lookupErr.message }, 500)
    if (!invite) return json({ error: 'Invitation introuvable' }, 404)
    if (invite.status !== 'pending') {
      return json({ error: 'Cette invitation a déjà été utilisée ou annulée.' }, 410)
    }
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from('team_invites').update({ status: 'expired' }).eq('id', invite.id)
      return json({ error: 'Cette invitation a expiré.' }, 410)
    }

    // 2. The accepting user's email must match the invite (case-insensitive).
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return json({
        error: `Cette invitation a été envoyée à ${invite.email}. Connectez-vous avec ce compte pour l'accepter.`,
      }, 403)
    }

    // 3. Don't add twice if they were re-invited and already a member.
    const { data: existing } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', invite.team_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      // 4. Remove the user from any previous team (Phase 1 = single team).
      await supabaseAdmin
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .neq('role', 'owner')

      // 5. Insert the team_members row with the scopes from the invite.
      const { error: insertErr } = await supabaseAdmin
        .from('team_members')
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: 'member',
          visibility_mode: invite.visibility_mode,
          scopes: invite.scopes,
        })
      if (insertErr) return json({ error: insertErr.message }, 500)
    }

    // 6. Point user_profiles.team_id at the new team.
    await supabaseAdmin
      .from('user_profiles')
      .update({ team_id: invite.team_id })
      .eq('id', user.id)

    // 7. Mark the invite as accepted.
    await supabaseAdmin
      .from('team_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id)

    return json({ team_id: invite.team_id })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
