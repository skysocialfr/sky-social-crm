-- Add suspended column to user_profiles
alter table public.user_profiles
  add column if not exists suspended boolean not null default false;

-- Replace get_all_user_profiles to include new fields
create or replace function public.get_all_user_profiles()
returns table (
  id               uuid,
  email            text,
  company_name     text,
  primary_color    text,
  logo_url         text,
  is_admin         boolean,
  suspended        boolean,
  prospect_count   bigint,
  last_sign_in_at  timestamptz,
  created_at       timestamptz
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
    up.created_at
  from public.user_profiles up
  join auth.users au on au.id = up.id
  where public.is_admin()
  order by up.created_at desc;
$$ language sql security definer stable;

-- Function to suspend/unsuspend a user (admin only)
create or replace function public.set_user_suspended(target_id uuid, suspended_val boolean)
returns void as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  update public.user_profiles
    set suspended = suspended_val
    where id = target_id;
end;
$$ language plpgsql security definer;
