-- ============================================================
-- 012: configurable pipelines per team
-- ============================================================
-- Until now every team shared the same 8 hardcoded stages
-- ('Identifié' → 'Perdu'). Teams that run multiple acquisition
-- motions (B2B sales, supplier onboarding, B2C, etc.) want their
-- own stage flows. This migration introduces a `pipelines` table
-- and links every prospect to one pipeline.
--
-- Migration strategy: each existing team gets a default
-- "Commercial" pipeline pre-filled with the legacy 8 stages, and
-- every existing prospect is assigned to it. The frontend keeps
-- working with prospects whose `stage` column still holds those
-- exact labels, because the default pipeline carries the same
-- labels. No data rewriting required.

-- ----------------------------------------------------------------
-- 1. pipelines table
-- ----------------------------------------------------------------
-- stages is an ordered jsonb array of {label, color}. The label is
-- the source of truth used by prospects.stage (text). Reordering
-- or recoloring stages doesn't touch prospects. Renaming a stage
-- requires updating prospects in the same transaction (handled at
-- the application layer; we don't add a trigger for it because
-- it's an explicit owner-only action with a confirmation).

create table if not exists public.pipelines (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  name        text not null,
  stages      jsonb not null default '[]'::jsonb,
  is_default  boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_pipelines_team_id on public.pipelines(team_id);
-- Only one default pipeline per team.
create unique index if not exists uq_pipelines_one_default_per_team
  on public.pipelines(team_id) where is_default;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_pipelines_updated_at') then
    create trigger set_pipelines_updated_at
      before update on public.pipelines
      for each row execute function public.update_updated_at();
  end if;
end $$;

alter table public.pipelines enable row level security;

-- ----------------------------------------------------------------
-- 2. Backfill: one default "Commercial" pipeline per team
-- ----------------------------------------------------------------

insert into public.pipelines (team_id, name, stages, is_default, position)
select
  t.id,
  'Commercial',
  jsonb_build_array(
    jsonb_build_object('label', 'Identifié',      'color', '#64748b'),
    jsonb_build_object('label', 'Premier contact','color', '#3b82f6'),
    jsonb_build_object('label', 'Réponse reçue',  'color', '#06b6d4'),
    jsonb_build_object('label', 'RDV fixé',       'color', '#8b5cf6'),
    jsonb_build_object('label', 'Devis envoyé',   'color', '#f59e0b'),
    jsonb_build_object('label', 'En négociation', 'color', '#f97316'),
    jsonb_build_object('label', 'Gagné',          'color', '#10b981'),
    jsonb_build_object('label', 'Perdu',          'color', '#ef4444')
  ),
  true,
  0
from public.teams t
where not exists (
  select 1 from public.pipelines p
   where p.team_id = t.id and p.is_default
);

-- ----------------------------------------------------------------
-- 3. prospects: add pipeline_id (nullable then backfilled)
-- ----------------------------------------------------------------

alter table public.prospects
  add column if not exists pipeline_id uuid references public.pipelines(id) on delete restrict;

update public.prospects p
set pipeline_id = pl.id
from public.pipelines pl
where pl.team_id = p.team_id
  and pl.is_default
  and p.pipeline_id is null;

alter table public.prospects
  alter column pipeline_id set not null;

create index if not exists idx_prospects_pipeline_id on public.prospects(pipeline_id);

-- ----------------------------------------------------------------
-- 4. Auto-fill pipeline_id on INSERT (mirror of fill_team_id)
-- ----------------------------------------------------------------
-- The frontend will pass pipeline_id explicitly once the multi-
-- pipeline UI ships, but legacy callers (CSV imports, integrations)
-- still rely on a default. Resolve it from the team's default
-- pipeline at insert time.

create or replace function public.fill_pipeline_id_on_prospect()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pipeline_id is null then
    select id into new.pipeline_id
    from public.pipelines
    where team_id = new.team_id and is_default
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists fill_pipeline_id_on_prospect_trg on public.prospects;
-- Must fire AFTER fill_team_id (so team_id is available); both are
-- BEFORE INSERT triggers and Postgres fires them alphabetically.
-- 'fill_pipeline_id_on_prospect_trg' > 'fill_team_id_on_prospect_trg' ✓.
create trigger fill_pipeline_id_on_prospect_trg
  before insert on public.prospects
  for each row execute function public.fill_pipeline_id_on_prospect();

revoke all on function public.fill_pipeline_id_on_prospect() from public;
grant execute on function public.fill_pipeline_id_on_prospect() to authenticated, service_role;

-- ----------------------------------------------------------------
-- 5. handle_new_user: also create the default pipeline
-- ----------------------------------------------------------------
-- handle_new_user creates the user_profile + solo team + owner row
-- (migration 010). Extend it so brand-new solo teams also get the
-- default Commercial pipeline.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
begin
  insert into public.user_profiles (id, company_name)
  values (new.id, '')
  on conflict (id) do nothing;

  insert into public.teams (owner_id, name)
  values (new.id, coalesce(new.email, 'Mon espace'))
  returning id into v_team_id;

  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, new.id, 'owner');

  update public.user_profiles
  set team_id = v_team_id
  where id = new.id;

  -- Default pipeline for the brand-new team.
  insert into public.pipelines (team_id, name, stages, is_default, position)
  values (
    v_team_id,
    'Commercial',
    jsonb_build_array(
      jsonb_build_object('label', 'Identifié',      'color', '#64748b'),
      jsonb_build_object('label', 'Premier contact','color', '#3b82f6'),
      jsonb_build_object('label', 'Réponse reçue',  'color', '#06b6d4'),
      jsonb_build_object('label', 'RDV fixé',       'color', '#8b5cf6'),
      jsonb_build_object('label', 'Devis envoyé',   'color', '#f59e0b'),
      jsonb_build_object('label', 'En négociation', 'color', '#f97316'),
      jsonb_build_object('label', 'Gagné',          'color', '#10b981'),
      jsonb_build_object('label', 'Perdu',          'color', '#ef4444')
    ),
    true,
    0
  );

  return new;
end;
$$;

-- ----------------------------------------------------------------
-- 6. RLS policies for pipelines
-- ----------------------------------------------------------------
-- SELECT: any team member can read their team's pipelines.
-- INSERT/UPDATE/DELETE: owner only (to keep stage hygiene under
-- their control, same as custom rubriques).

drop policy if exists pipelines_select on public.pipelines;
create policy pipelines_select on public.pipelines
  for select using (public.is_team_member(team_id));

drop policy if exists pipelines_insert on public.pipelines;
create policy pipelines_insert on public.pipelines
  for insert with check (public.is_team_owner(team_id));

drop policy if exists pipelines_update on public.pipelines;
create policy pipelines_update on public.pipelines
  for update
  using      (public.is_team_owner(team_id))
  with check (public.is_team_owner(team_id));

drop policy if exists pipelines_delete on public.pipelines;
create policy pipelines_delete on public.pipelines
  for delete using (public.is_team_owner(team_id));

-- Guard: the default pipeline can't be deleted while prospects use
-- it. Without prospects referenced, deleting the default is also
-- blocked (a team must always have a default — the UI enforces
-- promoting another pipeline to default before deletion).

create or replace function public.prevent_default_pipeline_deletion()
returns trigger
language plpgsql
as $$
begin
  if OLD.is_default
     and exists (select 1 from public.teams where id = OLD.team_id) then
    raise exception 'Cannot delete the default pipeline. Promote another pipeline to default first.'
      using errcode = 'P0001';
  end if;
  if exists (select 1 from public.prospects where pipeline_id = OLD.id) then
    raise exception 'Cannot delete a pipeline that still contains prospects. Move or delete them first.'
      using errcode = 'P0001';
  end if;
  return OLD;
end;
$$;

drop trigger if exists prevent_default_pipeline_deletion_trg on public.pipelines;
create trigger prevent_default_pipeline_deletion_trg
  before delete on public.pipelines
  for each row execute function public.prevent_default_pipeline_deletion();
