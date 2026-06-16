-- ============================================================
-- 013: relax prospects.stage from enum to text
-- ============================================================
-- Migration 012 made pipelines configurable per team, so each
-- team can define its own stage labels (Candidat, Vérifié,
-- Visiteur, 1ère réservation, …). But `prospects.stage` is still
-- declared with the hard-coded `pipeline_stage` enum from the
-- initial schema, so inserts with any non-legacy label fail with
-- `invalid input value for enum pipeline_stage`.
--
-- Fix: drop the enum constraint and store stage as plain text.
-- Existing rows keep their exact literal value (Identifié, Premier
-- contact, …) — casting an enum to text preserves the label. So
-- this migration is a no-op for solo accounts that haven't created
-- new pipelines yet.

-- The column has a default of 'Identifié'::pipeline_stage. Drop
-- it before changing the type, then re-add it as text.
alter table public.prospects
  alter column stage drop default;

alter table public.prospects
  alter column stage type text using stage::text;

alter table public.prospects
  alter column stage set default 'Identifié';

-- The enum is no longer referenced anywhere.
drop type if exists public.pipeline_stage;
