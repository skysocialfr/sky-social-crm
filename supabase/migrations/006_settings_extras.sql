-- ============================================================
-- Notification preferences + self-service account deletion
-- ============================================================

-- Notification preferences (email)
alter table public.user_profiles
  add column if not exists notification_prefs jsonb not null default '{
    "email_relances_overdue": true,
    "email_weekly_recap": true,
    "email_new_prospect": false
  }'::jsonb;

-- ============================================================
-- Self-service account deletion
-- Removes the caller's profile and all their data.
-- The auth.users row is left intact (deletion of the auth account
-- itself requires the service-role key and should go through an
-- edge function if desired).
-- ============================================================
create or replace function public.delete_my_account()
returns void as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.interactions where user_id = uid;
  delete from public.prospects    where user_id = uid;
  delete from public.user_profiles where id      = uid;
end;
$$ language plpgsql security definer;

revoke all on function public.delete_my_account() from public;
grant  execute on function public.delete_my_account() to authenticated;
