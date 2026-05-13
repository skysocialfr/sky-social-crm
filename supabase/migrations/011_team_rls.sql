-- ============================================================
-- 011: team-aware RLS + scope-based delegation
-- ============================================================
-- Replaces the user-level RLS policies on prospects + interactions
-- with team-aware ones. Visibility is now:
--
--   - Team owner: sees and edits everything in the team.
--   - Member with visibility_mode = 'read_all':
--       * SELECT  → entire team's prospects
--       * UPDATE  → only prospects matching their scopes, OR their own
--                   creations, OR prospects assigned to them
--   - Member with visibility_mode = 'scope_only' (default):
--       * SELECT/UPDATE → only prospects matching scopes, OR their own
--                         creations, OR prospects assigned to them
--
-- "Matching scopes" means: for every key K in scopes, the prospect's
-- custom_data->>K must be one of scopes[K]. AND between keys (so a
-- member with {zone: ["paris"], specialite: ["mariage"]} only sees
-- Paris mariage prospects).
--
-- Idempotent: drops + recreates everything it owns.

-- ----------------------------------------------------------------
-- Helper: is the current user a member of team T?
-- ----------------------------------------------------------------

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
     where team_id = p_team_id
       and user_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
     where team_id = p_team_id
       and user_id = auth.uid()
       and role = 'owner'
  );
$$;

revoke all on function public.is_team_member(uuid)  from public;
revoke all on function public.is_team_owner(uuid)   from public;
grant execute on function public.is_team_member(uuid) to authenticated, service_role;
grant execute on function public.is_team_owner(uuid)  to authenticated, service_role;

-- ----------------------------------------------------------------
-- Helper: does the prospect (identified by its scalar fields) match
-- the current user's scope?
-- ----------------------------------------------------------------
-- Returns true if the current user (auth.uid()) is allowed to mutate
-- the given prospect within scope_only semantics. The SELECT policies
-- combine this with the read_all override separately.
--
-- Logic:
--   - Not a team member at all → false
--   - Owner of the team        → true (no restriction)
--   - Creator of the prospect  → true (own creations stay visible)
--   - Assigned to the prospect → true
--   - scopes = {}              → true (no restriction)
--   - Otherwise: every key in scopes must have its allowed-values list
--     contain (custom_data ->> key).
--
-- Scalar params (rather than a row-type) keep the call site
-- unambiguous inside policies.

create or replace function public.prospect_in_user_scope(
  p_team_id     uuid,
  p_user_id     uuid,
  p_assigned_to uuid,
  p_custom_data jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_role            text;
  v_scopes          jsonb;
  v_key             text;
  v_allowed_values  jsonb;
  v_actual          text;
begin
  select role, scopes
    into v_role, v_scopes
  from public.team_members
  where team_id = p_team_id and user_id = auth.uid();

  if not found then
    return false;
  end if;

  if v_role = 'owner'              then return true; end if;
  if p_user_id     = auth.uid()    then return true; end if;
  if p_assigned_to = auth.uid()    then return true; end if;
  if v_scopes = '{}'::jsonb        then return true; end if;

  for v_key, v_allowed_values in
    select * from jsonb_each(v_scopes)
  loop
    v_actual := coalesce(p_custom_data, '{}'::jsonb) ->> v_key;
    if v_actual is null then
      return false;
    end if;
    if not (v_allowed_values @> to_jsonb(v_actual)) then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.prospect_in_user_scope(uuid, uuid, uuid, jsonb) from public;
grant execute on function public.prospect_in_user_scope(uuid, uuid, uuid, jsonb)
  to authenticated, service_role;

-- For interactions: look up the prospect by id and delegate.
create or replace function public.prospect_id_in_user_scope(p_prospect_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_team_id     uuid;
  v_user_id     uuid;
  v_assigned_to uuid;
  v_custom_data jsonb;
begin
  select team_id, user_id, assigned_to, custom_data
    into v_team_id, v_user_id, v_assigned_to, v_custom_data
  from public.prospects
  where id = p_prospect_id;
  if not found then return false; end if;
  return public.prospect_in_user_scope(v_team_id, v_user_id, v_assigned_to, v_custom_data);
end;
$$;

revoke all on function public.prospect_id_in_user_scope(uuid) from public;
grant execute on function public.prospect_id_in_user_scope(uuid) to authenticated, service_role;

-- Helper: does the current user have read_all visibility on this team?
create or replace function public.has_read_all_on(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
     where team_id = p_team_id
       and user_id = auth.uid()
       and visibility_mode = 'read_all'
  );
$$;

revoke all on function public.has_read_all_on(uuid) from public;
grant execute on function public.has_read_all_on(uuid) to authenticated, service_role;

-- ----------------------------------------------------------------
-- teams: SELECT for members, UPDATE for owner only
-- ----------------------------------------------------------------

drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select using (public.is_team_member(id));

drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams
  for update
  using      (public.is_team_owner(id))
  with check (public.is_team_owner(id));

-- INSERT/DELETE locked at the RLS level. handle_new_user() creates
-- teams via the security-definer trigger (bypasses RLS), and the
-- accept-team-invite edge function inserts team_members using the
-- service role.
drop policy if exists teams_no_client_insert on public.teams;
create policy teams_no_client_insert on public.teams
  for insert with check (false);

drop policy if exists teams_no_client_delete on public.teams;
create policy teams_no_client_delete on public.teams
  for delete using (false);

-- ----------------------------------------------------------------
-- team_members: read for self + teammates, write via service role only
-- ----------------------------------------------------------------

drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
  for select using (public.is_team_member(team_id));

-- Owner can update scopes/visibility/role of teammates (but not their
-- own role, to prevent locking themselves out — enforced via trigger).
drop policy if exists team_members_update on public.team_members;
create policy team_members_update on public.team_members
  for update
  using      (public.is_team_owner(team_id))
  with check (public.is_team_owner(team_id));

-- Owner can remove members (but not themselves — enforced via trigger).
drop policy if exists team_members_delete on public.team_members;
create policy team_members_delete on public.team_members
  for delete using (public.is_team_owner(team_id));

-- INSERT is locked: only the service_role (used by accept-team-invite
-- edge function and the handle_new_user trigger) can add members.
drop policy if exists team_members_no_client_insert on public.team_members;
create policy team_members_no_client_insert on public.team_members
  for insert with check (false);

-- Guard: owner can't be demoted or removed (would orphan the team).
-- DELETE checks whether the parent team still exists: when a team is
-- deleted, the cascade fires this trigger but the team row is already
-- gone, so the check passes and the cascade proceeds normally.
create or replace function public.prevent_owner_demotion()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'UPDATE' then
    if OLD.role = 'owner' and NEW.role <> 'owner' then
      raise exception 'Cannot demote the team owner. Transfer ownership first.';
    end if;
  end if;
  if TG_OP = 'DELETE' then
    if OLD.role = 'owner'
       and exists (select 1 from public.teams where id = OLD.team_id) then
      raise exception 'Cannot remove the team owner. Delete the team instead.';
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists prevent_owner_demotion_trg on public.team_members;
create trigger prevent_owner_demotion_trg
  before update or delete on public.team_members
  for each row execute function public.prevent_owner_demotion();

-- ----------------------------------------------------------------
-- team_invites: owner manages, invitees access via token (edge function)
-- ----------------------------------------------------------------
-- Reading invites by token happens via the accept-team-invite edge
-- function using the service role, so RLS only needs to support the
-- owner viewing/managing them from the dashboard.

drop policy if exists team_invites_select on public.team_invites;
create policy team_invites_select on public.team_invites
  for select using (public.is_team_owner(team_id));

drop policy if exists team_invites_insert on public.team_invites;
create policy team_invites_insert on public.team_invites
  for insert with check (public.is_team_owner(team_id));

drop policy if exists team_invites_update on public.team_invites;
create policy team_invites_update on public.team_invites
  for update
  using      (public.is_team_owner(team_id))
  with check (public.is_team_owner(team_id));

drop policy if exists team_invites_delete on public.team_invites;
create policy team_invites_delete on public.team_invites
  for delete using (public.is_team_owner(team_id));

-- ----------------------------------------------------------------
-- prospects: rewire RLS to use team_id + scopes
-- ----------------------------------------------------------------

drop policy if exists prospects_select_own on public.prospects;
drop policy if exists prospects_insert_own on public.prospects;
drop policy if exists prospects_update_own on public.prospects;
drop policy if exists prospects_delete_own on public.prospects;
drop policy if exists prospects_select      on public.prospects;
drop policy if exists prospects_insert      on public.prospects;
drop policy if exists prospects_update      on public.prospects;
drop policy if exists prospects_delete      on public.prospects;

-- SELECT: owner sees all; read_all members see all; otherwise scope match.
create policy prospects_select on public.prospects
  for select using (
    public.is_team_owner(team_id)
    or public.has_read_all_on(team_id)
    or public.prospect_in_user_scope(team_id, user_id, assigned_to, custom_data)
  );

-- INSERT: any team member; must insert with own user_id (RLS check)
-- and a team_id matching their team (enforced via the fill_team_id
-- trigger from migration 010 + this check).
create policy prospects_insert on public.prospects
  for insert
  with check (
    public.is_team_member(team_id)
    and user_id = auth.uid()
  );

-- UPDATE: owner can update everything; others only if in scope.
-- (read_all gives read, not write — writes still require scope match.)
create policy prospects_update on public.prospects
  for update
  using (
    public.is_team_owner(team_id)
    or public.prospect_in_user_scope(team_id, user_id, assigned_to, custom_data)
  )
  with check (
    public.is_team_owner(team_id)
    or public.prospect_in_user_scope(team_id, user_id, assigned_to, custom_data)
  );

-- DELETE: owner everywhere; members only on prospects they created.
create policy prospects_delete on public.prospects
  for delete using (
    public.is_team_owner(team_id)
    or user_id = auth.uid()
  );

-- ----------------------------------------------------------------
-- Trigger: only the owner can change assigned_to
-- ----------------------------------------------------------------

create or replace function public.prevent_assigned_to_change_by_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.assigned_to is distinct from OLD.assigned_to then
    if not public.is_team_owner(NEW.team_id) then
      raise exception 'Only the team owner can reassign a prospect.'
        using errcode = 'P0001';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists prevent_assigned_to_change_trg on public.prospects;
create trigger prevent_assigned_to_change_trg
  before update on public.prospects
  for each row execute function public.prevent_assigned_to_change_by_member();

revoke all on function public.prevent_assigned_to_change_by_member() from public;
grant execute on function public.prevent_assigned_to_change_by_member() to authenticated, service_role;

-- ----------------------------------------------------------------
-- interactions: rewire RLS to inherit from parent prospect
-- ----------------------------------------------------------------

drop policy if exists interactions_select_own on public.interactions;
drop policy if exists interactions_insert_own on public.interactions;
drop policy if exists interactions_update_own on public.interactions;
drop policy if exists interactions_delete_own on public.interactions;
drop policy if exists interactions_select      on public.interactions;
drop policy if exists interactions_insert      on public.interactions;
drop policy if exists interactions_update      on public.interactions;
drop policy if exists interactions_delete      on public.interactions;

-- SELECT: visible if the parent prospect is visible (same rules).
create policy interactions_select on public.interactions
  for select using (
    public.is_team_owner(team_id)
    or public.has_read_all_on(team_id)
    or public.prospect_id_in_user_scope(prospect_id)
  );

-- INSERT: any team member who can mutate the parent prospect.
create policy interactions_insert on public.interactions
  for insert
  with check (
    public.is_team_member(team_id)
    and user_id = auth.uid()
    and (
      public.is_team_owner(team_id)
      or public.prospect_id_in_user_scope(prospect_id)
    )
  );

-- UPDATE: own interactions only (per the user_id WITH CHECK semantics
-- from migration 009), AND parent prospect must be in scope.
create policy interactions_update on public.interactions
  for update
  using (
    user_id = auth.uid()
    and (
      public.is_team_owner(team_id)
      or public.prospect_id_in_user_scope(prospect_id)
    )
  )
  with check (
    user_id = auth.uid()
    and (
      public.is_team_owner(team_id)
      or public.prospect_id_in_user_scope(prospect_id)
    )
  );

-- DELETE: own interactions, or owner can delete any.
create policy interactions_delete on public.interactions
  for delete using (
    public.is_team_owner(team_id)
    or user_id = auth.uid()
  );

-- ----------------------------------------------------------------
-- Update enforce_prospect_limit to count per team, look up team's
-- owner subscription as the source of truth.
-- ----------------------------------------------------------------

create or replace function public.enforce_prospect_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id  uuid;
  v_limit     int;
  v_count     int;
begin
  -- new.team_id is guaranteed non-null thanks to fill_team_id_on_prospect
  -- (migration 010), but defend against a missing row anyway.
  select owner_id into v_owner_id
  from public.teams
  where id = new.team_id;

  if v_owner_id is null then
    -- Should never happen; fall back to permissive behaviour.
    return new;
  end if;

  select coalesce(prospect_limit, 25) into v_limit
  from public.subscriptions
  where user_id = v_owner_id;
  v_limit := coalesce(v_limit, 25);

  select count(*) into v_count
  from public.prospects
  where team_id = new.team_id;

  if v_count >= v_limit then
    raise exception 'PROSPECT_LIMIT_REACHED: vous avez atteint la limite de % prospects de votre plan.', v_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- ----------------------------------------------------------------
-- RPC: list team members with emails (joined from auth.users)
-- ----------------------------------------------------------------
-- auth.users isn't readable via RLS, so the front-end can't join it
-- directly. This security-definer RPC checks that the caller is a
-- member of the requested team, then returns the rows enriched with
-- email + company_name as a fallback display name.

create or replace function public.get_team_members(p_team_id uuid)
returns table (
  team_id          uuid,
  user_id          uuid,
  role             text,
  visibility_mode  text,
  scopes           jsonb,
  joined_at        timestamptz,
  email            text,
  display_name     text
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_team_member(p_team_id) then
    raise exception 'Forbidden: not a member of this team' using errcode = '42501';
  end if;

  return query
  select
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.visibility_mode,
    tm.scopes,
    tm.joined_at,
    au.email::text,
    nullif(trim(up.company_name), '') as display_name
  from public.team_members tm
  join auth.users au          on au.id = tm.user_id
  left join public.user_profiles up on up.id = tm.user_id
  where tm.team_id = p_team_id
  order by tm.role desc, tm.joined_at asc;
end;
$$;

revoke all on function public.get_team_members(uuid) from public;
grant execute on function public.get_team_members(uuid) to authenticated;

-- ----------------------------------------------------------------
-- Drop the legacy custom_fields_schema column from user_profiles.
-- ----------------------------------------------------------------
-- The source of truth is now teams.custom_fields_schema (migration 010
-- copied each user_profiles.custom_fields_schema into their solo team).
-- Keeping the legacy column would invite divergence — drop it cleanly
-- now that the data is migrated.

alter table public.user_profiles
  drop column if exists custom_fields_schema;
