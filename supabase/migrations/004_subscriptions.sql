-- Subscriptions table
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete cascade unique,
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  status                 text not null default 'free',  -- free | active | cancelled | past_due
  current_period_end     timestamptz,
  prospect_limit         int not null default 25,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger set_subscription_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Update get_all_user_profiles to include subscription status
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
    up.created_at
  from public.user_profiles up
  join auth.users au on au.id = up.id
  left join public.subscriptions s on s.user_id = up.id
  where public.is_admin()
  order by up.created_at desc;
$$ language sql security definer stable;
