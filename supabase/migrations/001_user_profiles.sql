-- ============================================================
-- user_profiles : branding et rôle par compte
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

create table public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  company_name  text not null default '',
  primary_color text not null default '217 91% 60%',
  logo_url      text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Trigger : créer automatiquement une ligne à chaque inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger updated_at (réutilise la fonction déjà définie dans schema.sql)
create trigger set_profile_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- Fonction is_admin() — SECURITY DEFINER pour éviter récursion RLS
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.user_profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable;

-- ============================================================
-- RLS
-- ============================================================
alter table public.user_profiles enable row level security;

create policy "profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = false);

create policy "profiles_admin_select_all"
  on public.user_profiles for select
  using (public.is_admin());

-- ============================================================
-- Fonction admin : récupère tous les profils avec email
-- ============================================================
create or replace function public.get_all_user_profiles()
returns table (
  id            uuid,
  email         text,
  company_name  text,
  primary_color text,
  logo_url      text,
  is_admin      boolean,
  created_at    timestamptz
) as $$
  select
    up.id,
    au.email,
    up.company_name,
    up.primary_color,
    up.logo_url,
    up.is_admin,
    up.created_at
  from public.user_profiles up
  join auth.users au on au.id = up.id
  where public.is_admin()
  order by up.created_at desc;
$$ language sql security definer stable;

-- ============================================================
-- Storage : bucket logos (public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict do nothing;

create policy "logos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

-- ============================================================
-- Migration des comptes existants (profils manquants)
-- ============================================================
insert into public.user_profiles (id, company_name)
select
  au.id,
  coalesce(au.raw_user_meta_data->>'company_name', '')
from auth.users au
where not exists (
  select 1 from public.user_profiles up where up.id = au.id
);
