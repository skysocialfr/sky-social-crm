-- ============================================================
-- Subscription plans : free | pro | team
-- ============================================================

alter table public.subscriptions
  add column if not exists plan text not null default 'free';

-- Backfill: any active subscription before this migration was on the
-- Pro plan (it was the only paid tier).
update public.subscriptions
   set plan = 'pro'
 where status = 'active' and plan = 'free';

-- Optional sanity constraint
alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'pro', 'team'));

-- Expose plan in the admin view
create or replace function public.get_all_user_profiles()
returns table (
  id                  uuid,
  email               text,
  company_name        text,
  primary_color       text,
  logo_url            text,
  is_admin            boolean,
  suspended           boolean,
  prospect_count      bigint,
  last_sign_in_at     timestamptz,
  subscription_status text,
  subscription_plan   text,
  created_at          timestamptz
) as $$
  select
    up.id,
    au.email,
    up.company_name,
    up.primary_color,
    up.logo_url,
    up.is_admin,
    up.suspended,
    (select count(*) from public.prospects p where p.user_id = up.id),
    au.last_sign_in_at,
    coalesce(s.status, 'free'),
    coalesce(s.plan,   'free'),
    up.created_at
  from public.user_profiles up
  join auth.users au on au.id = up.id
  left join public.subscriptions s on s.user_id = up.id
  where public.is_admin()
  order by up.created_at desc;
$$ language sql security definer stable;
