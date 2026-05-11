-- ============================================================
-- Custom fields & sections (per-tenant CRM customization)
-- ============================================================
-- Lets each tenant define their own rubriques + champs from the
-- Settings UI without us touching code or schema. Mirrors the
-- section_prefs pattern (002_section_prefs.sql): a single JSONB
-- column on user_profiles holds the schema, a JSONB column on
-- prospects holds the per-prospect values keyed by field.key.

-- Per-tenant schema definition (sections[].fields[])
alter table public.user_profiles
  add column if not exists custom_fields_schema jsonb
    not null default '{"sections":[]}'::jsonb;

-- Per-prospect values, keyed by field.key from the tenant schema
alter table public.prospects
  add column if not exists custom_data jsonb
    not null default '{}'::jsonb;
