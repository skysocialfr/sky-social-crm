import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Sends the notification emails promised in Settings → Notifications:
//
//   kind = 'daily'  → "Relances en retard" : every morning, one email per
//                     user listing the follow-ups due today or overdue.
//   kind = 'weekly' → "Récapitulatif hebdo" : every Monday, new prospects,
//                     deals won, and the follow-ups coming this week.
//
// Triggered by pg_cron (migration 014) with a shared secret — never by the
// browser — so gateway JWT verification is off (config.toml) and we check
// the bearer ourselves. Visibility follows the same rules as the app
// (owner sees the team, members see their scope) so nobody is emailed
// about prospects they can't open.

type Kind = 'daily' | 'weekly'

interface Profile {
  id: string
  team_id: string | null
  company_name: string
  notification_prefs: Record<string, boolean> | null
}

interface Member {
  team_id: string
  user_id: string
  role: 'owner' | 'member'
  visibility_mode: 'scope_only' | 'read_all'
  scopes: Record<string, string[]>
}

interface Prospect {
  id: string
  team_id: string
  user_id: string
  assigned_to: string | null
  company_name: string
  first_name: string
  last_name: string
  stage: string
  priority: string
  deal_value: number | null
  next_followup_date: string | null
  custom_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

const CLOSED_STAGES = ['Gagné', 'Perdu']
const MAX_ROWS = 15

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const secret = Deno.env.get('CRON_SECRET')
  if (!secret) return json({ error: 'CRON_SECRET not configured' }, 500)
  if (req.headers.get('Authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let kind: Kind = 'daily'
  try {
    const body = await req.json()
    if (body?.kind === 'weekly') kind = 'weekly'
  } catch {
    // Empty body → daily.
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return json({ error: 'RESEND_API_KEY not configured' }, 500)
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@velmiocrm.com'
  const appUrl = Deno.env.get('APP_URL') ?? 'https://app.velmiocrm.com'

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const prefKey = kind === 'daily' ? 'email_relances_overdue' : 'email_weekly_recap'
  const today = parisToday()

  // 1. Who opted in?
  const { data: profiles, error: profErr } = await admin
    .from('user_profiles')
    .select('id, team_id, company_name, notification_prefs')
    .eq('suspended', false)
    .not('team_id', 'is', null)
  if (profErr) return json({ error: profErr.message }, 500)

  const recipients = (profiles as Profile[]).filter(
    (p) => p.notification_prefs?.[prefKey] !== false,
  )
  if (recipients.length === 0) return json({ kind, sent: 0, skipped: 0 })

  const teamIds = [...new Set(recipients.map((p) => p.team_id!))]

  // 2. Memberships (for visibility) and prospects, one query each.
  const { data: members, error: memErr } = await admin
    .from('team_members')
    .select('team_id, user_id, role, visibility_mode, scopes')
    .in('team_id', teamIds)
  if (memErr) return json({ error: memErr.message }, 500)

  let query = admin
    .from('prospects')
    .select(
      'id, team_id, user_id, assigned_to, company_name, first_name, last_name, stage, priority, deal_value, next_followup_date, custom_data, created_at, updated_at',
    )
    .in('team_id', teamIds)

  if (kind === 'daily') {
    query = query.lte('next_followup_date', today)
  } else {
    // Weekly needs recent activity too, not only due follow-ups.
    const weekAgo = shiftDays(today, -7)
    const weekAhead = shiftDays(today, 7)
    query = query.or(
      `next_followup_date.lte.${weekAhead},created_at.gte.${weekAgo},updated_at.gte.${weekAgo}`,
    )
  }
  const { data: prospects, error: prosErr } = await query
  if (prosErr) return json({ error: prosErr.message }, 500)

  const byTeam = new Map<string, Prospect[]>()
  for (const p of prospects as Prospect[]) {
    const list = byTeam.get(p.team_id) ?? []
    list.push(p)
    byTeam.set(p.team_id, list)
  }
  const memberOf = new Map<string, Member>()
  for (const m of members as Member[]) memberOf.set(`${m.team_id}:${m.user_id}`, m)

  // 3. One email per user.
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const profile of recipients) {
    const member = memberOf.get(`${profile.team_id}:${profile.id}`)
    if (!member) { skipped++; continue }

    const visible = (byTeam.get(profile.team_id!) ?? []).filter((p) =>
      prospectVisible(member, p, profile.id),
    )

    const email = kind === 'daily'
      ? buildDaily(visible, today, appUrl)
      : buildWeekly(visible, today, appUrl)
    if (!email) { skipped++; continue }

    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(profile.id)
    const to = userData?.user?.email
    if (userErr || !to) { skipped++; continue }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: email.subject,
        html: layout(email.html, profile.company_name, appUrl),
        text: email.text,
      }),
    })
    if (res.ok) {
      sent++
    } else {
      const err = await res.json().catch(() => ({}))
      errors.push(`${profile.id}: ${err.message ?? res.status}`)
    }
  }

  return json({ kind, date: today, sent, skipped, errors })
})

// ----------------------------------------------------------------
// Visibility — mirrors src/lib/scopeMatcher.ts and the SQL function
// prospect_in_user_scope (migration 011). Keep the three in sync.
// ----------------------------------------------------------------

function prospectVisible(member: Member, p: Prospect, userId: string): boolean {
  if (member.role === 'owner') return true
  if (member.visibility_mode === 'read_all') return true
  if (p.user_id === userId) return true
  if (p.assigned_to === userId) return true

  const keys = Object.keys(member.scopes ?? {})
  if (keys.length === 0) return true

  for (const key of keys) {
    const allowed = member.scopes[key]
    if (!Array.isArray(allowed) || allowed.length === 0) continue
    const actual = p.custom_data?.[key]
    if (actual == null) return false
    if (Array.isArray(actual)) {
      if (!actual.some((v) => allowed.includes(String(v)))) return false
    } else if (!allowed.includes(String(actual))) {
      return false
    }
  }
  return true
}

// ----------------------------------------------------------------
// Email content
// ----------------------------------------------------------------

interface Email { subject: string; html: string; text: string }

function buildDaily(prospects: Prospect[], today: string, appUrl: string): Email | null {
  const due = prospects
    .filter((p) => p.next_followup_date && !CLOSED_STAGES.includes(p.stage))
    .sort((a, b) => a.next_followup_date!.localeCompare(b.next_followup_date!))
  const overdue = due.filter((p) => p.next_followup_date! < today)
  const dueToday = due.filter((p) => p.next_followup_date! === today)
  if (due.length === 0) return null

  const subject = overdue.length > 0
    ? `${plural(due.length, 'relance')} à faire aujourd'hui, dont ${overdue.length} en retard`
    : `${plural(dueToday.length, 'relance')} à faire aujourd'hui`

  const html = [
    heading('Vos relances du jour'),
    overdue.length > 0
      ? section('En retard', '#dc2626', overdue.map((p) => rowHtml(p, appUrl, daysLate(p.next_followup_date!, today))))
      : '',
    dueToday.length > 0
      ? section("Aujourd'hui", '#6366f1', dueToday.map((p) => rowHtml(p, appUrl)))
      : '',
    cta('Ouvrir mes relances', `${appUrl}/app/relances`),
  ].join('')

  const text = [
    'Vos relances du jour',
    '',
    ...(overdue.length ? ['EN RETARD', ...overdue.map((p) => `- ${name(p)} (${daysLate(p.next_followup_date!, today)})`), ''] : []),
    ...(dueToday.length ? ["AUJOURD'HUI", ...dueToday.map((p) => `- ${name(p)}`), ''] : []),
    `${appUrl}/app/relances`,
  ].join('\n')

  return { subject, html, text }
}

function buildWeekly(prospects: Prospect[], today: string, appUrl: string): Email | null {
  const weekAgo = shiftDays(today, -7)
  const weekAhead = shiftDays(today, 7)

  const created = prospects.filter((p) => p.created_at.slice(0, 10) >= weekAgo)
  const won = prospects.filter((p) => p.stage === 'Gagné' && p.updated_at.slice(0, 10) >= weekAgo)
  const open = prospects.filter((p) => p.next_followup_date && !CLOSED_STAGES.includes(p.stage))
  const overdue = open.filter((p) => p.next_followup_date! < today)
  const upcoming = open
    .filter((p) => p.next_followup_date! >= today && p.next_followup_date! <= weekAhead)
    .sort((a, b) => a.next_followup_date!.localeCompare(b.next_followup_date!))

  if (created.length + won.length + overdue.length + upcoming.length === 0) return null

  const wonValue = won.reduce((s, p) => s + (p.deal_value ?? 0), 0)
  const subject = `Votre semaine : ${plural(created.length, 'nouveau prospect', 'nouveaux prospects')}, ${plural(won.length, 'deal gagné', 'deals gagnés')}, ${plural(upcoming.length, 'relance à venir', 'relances à venir')}`

  const html = [
    heading('Votre récapitulatif de la semaine'),
    stats([
      { label: 'Nouveaux prospects', value: String(created.length) },
      { label: 'Deals gagnés', value: String(won.length), sub: wonValue ? euros(wonValue) : undefined },
      { label: 'Relances en retard', value: String(overdue.length), color: overdue.length ? '#dc2626' : undefined },
      { label: 'À venir cette semaine', value: String(upcoming.length) },
    ]),
    won.length > 0 ? section('Gagnés cette semaine 🎉', '#10b981', won.map((p) => rowHtml(p, appUrl, p.deal_value ? euros(p.deal_value) : undefined))) : '',
    overdue.length > 0 ? section('En retard', '#dc2626', overdue.map((p) => rowHtml(p, appUrl, daysLate(p.next_followup_date!, today)))) : '',
    upcoming.length > 0 ? section('Relances de la semaine', '#6366f1', upcoming.map((p) => rowHtml(p, appUrl, frDate(p.next_followup_date!)))) : '',
    cta('Ouvrir mon tableau de bord', `${appUrl}/app`),
  ].join('')

  const text = [
    'Votre récapitulatif de la semaine',
    '',
    `Nouveaux prospects : ${created.length}`,
    `Deals gagnés : ${won.length}${wonValue ? ` (${euros(wonValue)})` : ''}`,
    `Relances en retard : ${overdue.length}`,
    `Relances à venir : ${upcoming.length}`,
    '',
    ...upcoming.map((p) => `- ${frDate(p.next_followup_date!)} · ${name(p)}`),
    '',
    `${appUrl}/app`,
  ].join('\n')

  return { subject, html, text }
}

// ----------------------------------------------------------------
// HTML building blocks (inline styles — email clients ignore <style>)
// ----------------------------------------------------------------

function layout(inner: string, company: string, appUrl: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#f4f6ff;font-family:'Plus Jakarta Sans',-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1c2e;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6ff;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e8eaf8;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:18px 28px;">
    <span style="display:inline-block;width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,.22);vertical-align:middle;margin-right:8px;"></span>
    <span style="color:#fff;font-weight:800;font-size:15px;vertical-align:middle;">Velmio CRM</span>
    ${company ? `<span style="color:rgba(255,255,255,.75);font-size:12px;vertical-align:middle;margin-left:8px;">· ${esc(company)}</span>` : ''}
  </td></tr>
  <tr><td style="padding:28px;">${inner}</td></tr>
  <tr><td style="padding:16px 28px 24px;border-top:1px solid #e8eaf8;font-size:11px;color:#9ca3af;line-height:1.6;">
    Vous recevez cet email car il est activé dans vos préférences.
    <a href="${appUrl}/app/settings" style="color:#6366f1;text-decoration:none;">Gérer mes notifications</a>
  </td></tr>
</table></td></tr></table></body></html>`
}

function heading(title: string): string {
  return `<h1 style="margin:0 0 18px;font-size:20px;font-weight:800;letter-spacing:-.01em;">${esc(title)}</h1>`
}

function section(title: string, color: string, rows: string[]): string {
  const shown = rows.slice(0, MAX_ROWS)
  const more = rows.length - shown.length
  return `<p style="margin:18px 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${color};">${esc(title)} · ${rows.length}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8eaf8;border-radius:12px;">${shown.join('')}</table>
${more > 0 ? `<p style="margin:6px 0 0;font-size:12px;color:#6b7280;">+ ${more} de plus dans l'application</p>` : ''}`
}

function rowHtml(p: Prospect, appUrl: string, meta?: string): string {
  const dot = p.priority === 'Chaud' ? '#f97316' : p.priority === 'Tiède' ? '#eab308' : '#94a3b8'
  return `<tr><td style="padding:10px 14px;border-bottom:1px solid #f1f2fb;">
  <a href="${appUrl}/app/prospects/${p.id}" style="text-decoration:none;color:#1a1c2e;font-size:14px;font-weight:600;">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dot};margin-right:8px;vertical-align:middle;"></span>${esc(name(p))}
  </a>
  <span style="float:right;font-size:12px;color:#6b7280;">${meta ? esc(meta) : esc(p.stage)}</span>
</td></tr>`
}

function stats(items: { label: string; value: string; sub?: string; color?: string }[]): string {
  const cells = items.map((s) => `<td width="25%" style="padding:12px 8px;text-align:center;background:#f8f9ff;border-radius:12px;">
    <div style="font-size:24px;font-weight:800;color:${s.color ?? '#1a1c2e'};">${esc(s.value)}</div>
    ${s.sub ? `<div style="font-size:12px;font-weight:600;color:#10b981;">${esc(s.sub)}</div>` : ''}
    <div style="font-size:11px;color:#6b7280;margin-top:2px;">${esc(s.label)}</div>
  </td>`).join('<td width="8"></td>')
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${cells}</tr></table>`
}

function cta(label: string, href: string): string {
  return `<p style="margin:24px 0 0;"><a href="${href}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;font-size:14px;padding:11px 20px;border-radius:10px;text-decoration:none;">${esc(label)} →</a></p>`
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function name(p: Prospect): string {
  const company = p.company_name?.trim()
  if (company) return company
  const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
  return full || 'Sans nom'
}

function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n > 1 ? pluralForm : singular}`
}

function daysLate(date: string, today: string): string {
  const d = Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000)
  return d === 1 ? 'hier' : `il y a ${d} jours`
}

function frDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function euros(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

// Calendar date in Paris, as YYYY-MM-DD. The cron fires in UTC; this keeps
// "today" aligned with the user's morning, not the server's.
function parisToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' })
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
