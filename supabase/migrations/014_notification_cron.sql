-- ============================================================
-- 014: scheduled notification emails (pg_cron → edge function)
-- ============================================================
-- Wires the two email toggles in Settings → Notifications to a real
-- schedule. Each job calls the send-notification-digest edge function
-- with a shared secret stored in Supabase Vault.
--
--   daily  : every day   at 06:00 UTC (08:00 Paris in summer, 07:00 in winter)
--   weekly : every Monday at 06:05 UTC
--
-- ONE-TIME SETUP before running this migration:
--
--   1. Pick a long random secret and set it on the edge function:
--        supabase secrets set CRON_SECRET=<secret> --project-ref dolkasdiajfhvfdoawxc
--   2. Store the SAME value in Vault (SQL editor):
--        select vault.create_secret('<secret>', 'cron_secret');
--
-- Idempotent: unschedules + reschedules the jobs it owns.

create extension if not exists pg_cron  with schema pg_catalog;
create extension if not exists pg_net   with schema extensions;

-- Small wrapper so the cron command stays readable and the URL/secret
-- lookup lives in one place.
create or replace function public.call_notification_digest(p_kind text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
begin
  select decrypted_secret
    into v_secret
  from vault.decrypted_secrets
  where name = 'cron_secret'
  limit 1;

  if v_secret is null then
    raise warning 'call_notification_digest: vault secret "cron_secret" is missing — skipping';
    return;
  end if;

  perform net.http_post(
    url     := 'https://dolkasdiajfhvfdoawxc.supabase.co/functions/v1/send-notification-digest',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body    := jsonb_build_object('kind', p_kind),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function public.call_notification_digest(text) from public;

do $$
begin
  perform cron.unschedule('velmio-digest-daily')  where exists (select 1 from cron.job where jobname = 'velmio-digest-daily');
  perform cron.unschedule('velmio-digest-weekly') where exists (select 1 from cron.job where jobname = 'velmio-digest-weekly');
end
$$;

select cron.schedule('velmio-digest-daily',  '0 6 * * *', $$select public.call_notification_digest('daily')$$);
select cron.schedule('velmio-digest-weekly', '5 6 * * 1', $$select public.call_notification_digest('weekly')$$);
