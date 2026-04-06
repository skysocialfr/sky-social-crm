-- ============================================================
-- Sky Social CRM — Schéma Supabase
-- Exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type pipeline_stage as enum (
  'Identifié',
  'Premier contact',
  'Réponse reçue',
  'RDV fixé',
  'Devis envoyé',
  'En négociation',
  'Gagné',
  'Perdu'
);

create type prospect_priority as enum ('Chaud', 'Tiède', 'Froid');

create type prospecting_channel as enum (
  'LinkedIn',
  'Email froid',
  'Instagram/DMs',
  'Téléphone/Physique'
);

create type company_size_enum as enum (
  'TPE (1-9)',
  'PME (10-249)',
  'ETI (250-4999)',
  'Grande entreprise (5000+)'
);

create type interaction_type as enum (
  'Appel',
  'Email',
  'LinkedIn',
  'Instagram',
  'Réunion',
  'Devis',
  'Note interne'
);

-- ============================================================
-- TABLE: prospects
-- ============================================================
create table prospects (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- Entreprise
  company_name        text not null,
  sector              text,
  company_size        company_size_enum,
  website             text,
  linkedin_url        text,
  instagram_url       text,

  -- Contact
  first_name          text not null,
  last_name           text not null,
  title               text,
  email               text,
  phone               text,

  -- Localisation
  city                text,
  country             text default 'France',

  -- CRM
  priority            prospect_priority not null default 'Froid',
  stage               pipeline_stage not null default 'Identifié',
  channel             prospecting_channel not null,
  services_interested text[] default '{}',

  -- Deal
  deal_value          numeric(12, 2),
  currency            text default 'EUR',

  -- Suivi
  next_followup_date  date,
  notes               text,

  -- Métadonnées
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- TABLE: interactions
-- ============================================================
create table interactions (
  id              uuid primary key default uuid_generate_v4(),
  prospect_id     uuid not null references prospects(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,

  type            interaction_type not null,
  date            timestamptz not null default now(),
  summary         text not null,
  outcome         text,
  next_action     text,

  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEX
-- ============================================================
create index idx_prospects_user_id        on prospects(user_id);
create index idx_prospects_stage          on prospects(stage);
create index idx_prospects_priority       on prospects(priority);
create index idx_prospects_next_followup  on prospects(next_followup_date);
create index idx_interactions_prospect_id on interactions(prospect_id);
create index idx_interactions_date        on interactions(date desc);

-- ============================================================
-- TRIGGER: updated_at automatique
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on prospects
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table prospects    enable row level security;
alter table interactions enable row level security;

-- Prospects
create policy "prospects_select_own" on prospects for select using (auth.uid() = user_id);
create policy "prospects_insert_own" on prospects for insert with check (auth.uid() = user_id);
create policy "prospects_update_own" on prospects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prospects_delete_own" on prospects for delete using (auth.uid() = user_id);

-- Interactions
create policy "interactions_select_own" on interactions for select using (auth.uid() = user_id);
create policy "interactions_insert_own" on interactions for insert with check (auth.uid() = user_id);
create policy "interactions_update_own" on interactions for update using (auth.uid() = user_id);
create policy "interactions_delete_own" on interactions for delete using (auth.uid() = user_id);
