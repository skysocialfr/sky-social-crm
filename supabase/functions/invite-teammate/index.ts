import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Phase 1: hard limit on members per team. Phase 2 lifts this in
// exchange for per-seat Stripe billing.
const PHASE_1_MAX_MEMBERS = 3

interface InviteBody {
  team_id: string
  email: string
  visibility_mode?: 'scope_only' | 'read_all'
  scopes?: Record<string, string[]>
}

function isValidEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const body = (await req.json()) as InviteBody
    if (!body?.team_id) return json({ error: 'Missing team_id' }, 400)
    if (!isValidEmail(body.email)) return json({ error: 'Invalid email' }, 400)

    const visibility_mode = body.visibility_mode === 'read_all' ? 'read_all' : 'scope_only'
    const scopes = body.scopes && typeof body.scopes === 'object' ? body.scopes : {}

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Caller must be owner of the team.
    const { data: membership, error: memberErr } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', body.team_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (memberErr) return json({ error: memberErr.message }, 500)
    if (!membership || membership.role !== 'owner') {
      return json({ error: 'Only the team owner can invite members' }, 403)
    }

    // 2. Team must have an active Team-plan subscription.
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!sub || sub.plan !== 'team' || (sub.status !== 'active' && sub.status !== 'past_due')) {
      return json({ error: 'A Team plan is required to invite collaborators' }, 402)
    }

    // 3. Phase 1: enforce member cap (current + pending invites).
    const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
      supabaseAdmin
        .from('team_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('team_id', body.team_id),
      supabaseAdmin
        .from('team_invites')
        .select('id', { count: 'exact', head: true })
        .eq('team_id', body.team_id)
        .eq('status', 'pending'),
    ])
    const total = (memberCount ?? 0) + (inviteCount ?? 0)
    if (total >= PHASE_1_MAX_MEMBERS) {
      return json({
        error: `Team plan limit reached (${PHASE_1_MAX_MEMBERS} members included). Contact support to add seats.`,
      }, 402)
    }

    // 4. Prevent re-inviting an existing member or duplicate pending invite.
    const { data: existingPending } = await supabaseAdmin
      .from('team_invites')
      .select('id')
      .eq('team_id', body.team_id)
      .eq('email', body.email.toLowerCase())
      .eq('status', 'pending')
      .maybeSingle()
    if (existingPending) {
      return json({ error: 'An invitation is already pending for this email' }, 409)
    }

    // 5. Create the invite row.
    const { data: invite, error: insertErr } = await supabaseAdmin
      .from('team_invites')
      .insert({
        team_id: body.team_id,
        email: body.email.toLowerCase(),
        invited_by: user.id,
        visibility_mode,
        scopes,
      })
      .select('id, token')
      .single()
    if (insertErr || !invite) return json({ error: insertErr?.message ?? 'Insert failed' }, 500)

    // 6. Send the invitation email via Supabase Auth (handles both new and
    // existing accounts). The token + team_id ride along in the user_meta
    // so the front-end can pick it up after login.
    const APP_URL = Deno.env.get('APP_URL') ?? 'https://app.velmiocrm.com'
    const redirectTo = `${APP_URL}/invite/${invite.token}`

    await supabaseAdmin.auth.admin.inviteUserByEmail(body.email.toLowerCase(), {
      data: { team_invite_token: invite.token, team_id: body.team_id },
      redirectTo,
    })
    // We intentionally don't fail the request if the email send hiccups —
    // the invite row is created and the owner can re-send from the UI.

    return json({ invite_id: invite.id })
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
