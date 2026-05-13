-- ============================================================
-- 010: teams (multi-user accounts)
-- ============================================================
-- Introduces shared workspaces ("teams"). Each existing user is
-- migrated to a solo team (owner = self), so behaviour is unchanged
-- for current single-user accounts. Prospects + interactions gain a
-- team_id (shared visibility) and prospects gain assigned_to (the
-- member responsible). custom_fields_schema moves to teams so all
-- members see the same rubriques — this is required for the
-- delegation feature (members are scoped on dropdown field values).
--
-- RLS is rewired in the next migration (011_team_rls.sql) so this
-- one can be reasoned about independently.
--
-- Idempotent: uses IF NOT EXISTS everywhere and guards backfills
-- against already-populated columns.

-- ----------------------------------------------------------------
-- 1. teams: the shared workspace
-- ----------------------------------------------------------------

create table if not exists public.teams (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null references auth.users(id) on delete restrict,
  name                 text not null,
  custom_fields_schema jsonb not null default '{"sections":[],"tabs":{}}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_teams_owner_id on public.teams(owner_id);

-- updated_at trigger (reuses the existing update_updated_at function)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_teams_updated_at'
  ) then
    create trigger set_teams_updated_at
      before update on public.teams
      for each row execute function public.update_updated_at();
  end if;
end $$;

alter table public.teams enable row level security;

-- ----------------------------------------------------------------
-- 2. team_members: who belongs to which team, role, scopes
-- ----------------------------------------------------------------
-- visibility_mode:
--   'scope_only' (default) — member only sees prospects matching their
--                            scopes (+ their own creations + prospects
--                            assigned to them).
--   'read_all'             — member sees the whole team's prospects in
--                            read-only outside their scope, can only
--                            mutate inside their scope.
--
-- scopes is a JSON dict {custom_field_key: [allowed_values]}. An empty
-- dict means "no restriction" (member sees the whole team).
-- The keys reference customFieldsSchema field keys flagged as
-- `delegable: true` (enforced in the UI, not at the DB level).

create table if not exists public.team_members (
  team_id          uuid not null references public.teams(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role             text not null check (role in ('owner', 'member')),
  visibility_mode  text not null default 'scope_only'
                     check (visibility_mode in ('scope_only', 'read_all')),
  scopes           jsonb not null default '{}'::jsonb,
  joined_at        timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists idx_team_members_user_id on public.team_members(user_id);

alter table public.team_members enable row level security;

-- ----------------------------------------------------------------
-- 3. team_invites: pending invitations
-- ----------------------------------------------------------------
-- The owner pre-configures visibility_mode + scopes at invite time;
-- they're copied into team_members on acceptance.
-- token is what the invitee uses in the URL to accept.

create table if not exists public.team_invites (
  id               uuid primary key default gen_random_uuid(),
  team_id          uuid not null references public.teams(id) on delete cascade,
  email            text not null,
  invited_by       uuid not null references auth.users(id),
  visibility_mode  text not null default 'scope_only'
                     check (visibility_mode in ('scope_only', 'read_all')),
  scopes           jsonb not null default '{}'::jsonb,
  token            uuid not null default gen_random_uuid() unique,
  status           text not null default 'pending'
                     check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_team_invites_email
  on public.team_invites(email) where status = 'pending';
create index if not exists idx_team_invites_token
  on public.team_invites(token) where status = 'pending';
create index if not exists idx_team_invites_team_id
  on public.team_invites(team_id);

alter table public.team_invites enable row level security;

-- ----------------------------------------------------------------
-- 4. Backfill: one team per existing user
-- ----------------------------------------------------------------
-- For every user_profiles row that doesn't already have a team, create
-- a solo team named after company_name (or email fallback). The user
-- becomes owner. Their existing custom_fields_schema moves to the team.

insert into public.teams (id, owner_id, name, custom_fields_schema, created_at, updated_at)
select
  gen_random_uuid(),
  up.id,
  coalesce(nullif(trim(up.company_name), ''), au.email, 'Mon espace'),
  coalesce(up.custom_fields_schema, '{"sections":[],"tabs":{}}'::jsonb),
  up.created_at,
  up.updated_at
from public.user_profiles up
join auth.users au on au.id = up.id
where not exists (
  select 1 from public.teams t where t.owner_id = up.id
);

insert into public.team_members (team_id, user_id, role, visibility_mode, scopes, joined_at)
select t.id, t.owner_id, 'owner', 'scope_only', '{}'::jsonb, t.created_at
from public.teams t
where not exists (
  select 1 from public.team_members tm
   where tm.team_id = t.id and tm.user_id = t.owner_id
);

-- ----------------------------------------------------------------
-- 5. user_profiles: add team_id pointer (the user's active team)
-- ----------------------------------------------------------------
-- For Phase 1 each user belongs to exactly one team. Keeping this
-- denormalised pointer lets the front-end resolve the active team
-- without an extra round-trip.

alter table public.user_profiles
  add column if not exists team_id uuid references public.teams(id) on delete set null;

update public.user_profiles up
set team_id = tm.team_id
from public.team_members tm
where tm.user_id = up.id and up.team_id is null;

create index if not exists idx_user_profiles_team_id on public.user_profiles(team_id);

-- ----------------------------------------------------------------
-- 6. prospects: add team_id + assigned_to
-- ----------------------------------------------------------------

alter table public.prospects
  add column if not exists team_id     uuid references public.teams(id) on delete cascade,
  add column if not exists assigned_to uuid references auth.users(id)   on delete set null;

-- Backfill from user_profiles (creator's team), assigned_to defaults
-- to creator so existing rows stay visible to their owner.
update public.prospects p
set team_id     = coalesce(p.team_id, up.team_id),
    assigned_to = coalesce(p.assigned_to, p.user_id)
from public.user_profiles up
where up.id = p.user_id
  and (p.team_id is null or p.assigned_to is null);

-- Now safe to enforce NOT NULL on team_id (every existing row has one).
alter table public.prospects
  alter column team_id set not null;

create index if not exists idx_prospects_team_id     on public.prospects(team_id);
create index if not exists idx_prospects_assigned_to on public.prospects(assigned_to);

-- ----------------------------------------------------------------
-- 7. interactions: add team_id
-- ----------------------------------------------------------------

alter table public.interactions
  add column if not exists team_id uuid references public.teams(id) on delete cascade;

update public.interactions i
set team_id = up.team_id
from public.user_profiles up
where up.id = i.user_id and i.team_id is null;

alter table public.interactions
  alter column team_id set not null;

create index if not exists idx_interactions_team_id on public.interactions(team_id);

-- ----------------------------------------------------------------
-- 8. Auto-assign team_id + assigned_to on INSERT
-- ----------------------------------------------------------------
-- Existing client code inserts prospects/interactions without setting
-- team_id (it doesn't know about teams yet). A BEFORE INSERT trigger
-- fills it from the inserter's user_profiles row. The trigger also
-- defaults assigned_to to the creator on prospects.
--
-- The front-end will be updated to send team_id explicitly later, but
-- this trigger guarantees correctness even if it forgets.

create or replace function public.fill_team_id_on_prospect()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.team_id is null then
    select team_id into new.team_id
    from public.user_profiles
    where id = new.user_id;
  end if;

  if new.assigned_to is null then
    new.assigned_to := new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists fill_team_id_on_prospect_trg on public.prospects;
create trigger fill_team_id_on_prospect_trg
  before insert on public.prospects
  for each row execute function public.fill_team_id_on_prospect();

revoke all on function public.fill_team_id_on_prospect() from public;
grant execute on function public.fill_team_id_on_prospect() to authenticated, service_role;

create or replace function public.fill_team_id_on_interaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.team_id is null then
    -- Prefer the parent prospect's team_id; fall back to the inserter's.
    select team_id into new.team_id from public.prospects where id = new.prospect_id;
    if new.team_id is null then
      select team_id into new.team_id from public.user_profiles where id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists fill_team_id_on_interaction_trg on public.interactions;
create trigger fill_team_id_on_interaction_trg
  before insert on public.interactions
  for each row execute function public.fill_team_id_on_interaction();

revoke all on function public.fill_team_id_on_interaction() from public;
grant execute on function public.fill_team_id_on_interaction() to authenticated, service_role;

-- ----------------------------------------------------------------
-- 9. Auto-create team for newly-signed-up users
-- ----------------------------------------------------------------
-- The existing handle_new_user() trigger creates user_profiles on
-- auth.users insert. We extend the same flow so every brand-new user
-- also gets a solo team. The trigger is recreated as a CREATE OR
-- REPLACE so the original behaviour (user_profiles insert) is
-- preserved.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
begin
  -- 1. Create the user profile (original behaviour).
  insert into public.user_profiles (id, company_name)
  values (new.id, '')
  on conflict (id) do nothing;

  -- 2. Create a solo team owned by this user.
  insert into public.teams (owner_id, name)
  values (new.id, coalesce(new.email, 'Mon espace'))
  returning id into v_team_id;

  -- 3. Add the user as owner of their team.
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, new.id, 'owner');

  -- 4. Point user_profiles.team_id at the new team.
  update public.user_profiles
  set team_id = v_team_id
  where id = new.id;

  return new;
end;
$$;
