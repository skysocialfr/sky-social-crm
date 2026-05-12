-- ============================================================
-- 009: security hardening (P0 audit findings)
-- ============================================================
-- Fixes three issues flagged by the security audit:
--
--   #2  interactions_update_own had a USING clause but no WITH CHECK,
--       which let a user transfer an interaction to another user by
--       updating user_id.
--
--   #1  The subscriptions table relied on the default-deny RLS, but
--       the audit recommends an explicit row-level check on UPDATE
--       so that a future ad-hoc INSERT/UPDATE policy can't accidentally
--       broaden writes (defense in depth). Writes from the create-
--       checkout / stripe-webhook edge functions use the service role
--       key and bypass RLS, so nothing changes for them.
--
--   #4  Prospect-count limit was only enforced client-side. A user
--       on the free plan (limit = 25) could POST directly to the
--       Supabase REST API and create thousands of rows. This adds
--       a BEFORE INSERT trigger that re-checks the count against the
--       subscription's prospect_limit and rejects with a clear error.
--
-- Idempotent: re-running this migration drops + recreates the policies
-- and the trigger.

-- ----------------------------------------------------------------
-- #2: interactions UPDATE — add WITH CHECK clause
-- ----------------------------------------------------------------

drop policy if exists "interactions_update_own" on public.interactions;
create policy "interactions_update_own"
  on public.interactions for update
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- #1: subscriptions — explicit deny on direct client writes
-- ----------------------------------------------------------------
-- The default-deny when no INSERT/UPDATE policy exists already blocks
-- the anon role, but we add an explicit "no rows match" policy so the
-- intent is obvious in the schema and survives future policy edits.

drop policy if exists "subscriptions_no_client_insert" on public.subscriptions;
create policy "subscriptions_no_client_insert"
  on public.subscriptions for insert
  with check (false);

drop policy if exists "subscriptions_no_client_update" on public.subscriptions;
create policy "subscriptions_no_client_update"
  on public.subscriptions for update
  using (false)
  with check (false);

drop policy if exists "subscriptions_no_client_delete" on public.subscriptions;
create policy "subscriptions_no_client_delete"
  on public.subscriptions for delete
  using (false);

-- ----------------------------------------------------------------
-- #4: prospect-count limit enforced at the DB level
-- ----------------------------------------------------------------
-- Reads the user's subscription row (security definer so it works
-- regardless of the calling role's RLS) and counts existing prospects.
-- If the count is already at or above the user's plan limit, the
-- INSERT is rejected with errcode P0001 and a French message that
-- can be surfaced to the UI.

create or replace function public.enforce_prospect_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit  int;
  v_count  int;
begin
  -- Fall back to the free-tier limit (25) when no subscription row
  -- exists yet (a brand-new user before checkout).
  select coalesce(prospect_limit, 25) into v_limit
  from public.subscriptions
  where user_id = new.user_id;
  v_limit := coalesce(v_limit, 25);

  select count(*) into v_count
  from public.prospects
  where user_id = new.user_id;

  if v_count >= v_limit then
    raise exception 'PROSPECT_LIMIT_REACHED: vous avez atteint la limite de % prospects de votre plan.', v_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_prospect_limit_trg on public.prospects;
create trigger enforce_prospect_limit_trg
  before insert on public.prospects
  for each row execute function public.enforce_prospect_limit();

-- Restrict execute to the roles that actually insert prospects.
revoke all on function public.enforce_prospect_limit() from public;
grant execute on function public.enforce_prospect_limit() to authenticated, service_role;
