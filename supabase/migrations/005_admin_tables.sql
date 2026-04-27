-- Plans
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_price numeric not null default 0,
  yearly_price numeric,
  color text default '#6366f1',
  features jsonb default '[]',
  seats_limit int,
  prospects_limit int,
  active bool not null default true,
  public bool not null default true,
  created_at timestamptz not null default now()
);

-- Feature flags
create table if not exists public.feature_flags (
  key text primary key,
  label text not null,
  status text not null default 'off',
  rollout_percent int default 0,
  plans jsonb default '[]',
  updated_at timestamptz not null default now()
);

-- Platform settings
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default 'null',
  description text,
  updated_at timestamptz not null default now()
);

-- Email templates
create table if not exists public.email_templates (
  key text primary key,
  name text not null,
  subject text not null,
  body_html text not null default '',
  body_text text,
  variables jsonb default '[]',
  enabled bool not null default true,
  last_edit timestamptz not null default now()
);

-- Changelog entries
create table if not exists public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  date date not null default current_date,
  tag text not null default 'feature',
  title text not null,
  body_md text,
  author_id uuid references auth.users(id),
  published bool not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS: admin-only access for all admin tables
alter table public.plans enable row level security;
alter table public.feature_flags enable row level security;
alter table public.platform_settings enable row level security;
alter table public.email_templates enable row level security;
alter table public.changelog_entries enable row level security;

create policy "plans_admin_all" on public.plans using (public.is_admin()) with check (public.is_admin());
create policy "feature_flags_admin_all" on public.feature_flags using (public.is_admin()) with check (public.is_admin());
create policy "platform_settings_admin_all" on public.platform_settings using (public.is_admin()) with check (public.is_admin());
create policy "email_templates_admin_all" on public.email_templates using (public.is_admin()) with check (public.is_admin());
create policy "changelog_entries_admin_all" on public.changelog_entries using (public.is_admin()) with check (public.is_admin());

-- Seed plans
insert into public.plans (name, monthly_price, yearly_price, color, prospects_limit, features) values
  ('Gratuit', 0, 0, '#6b7280', 25, '["25 prospects","Pipeline Kanban","Relances","Personnalisation"]'),
  ('Pro', 9, 79, '#6366f1', null, '["Prospects illimités","Import CSV/Excel","Email direct","Export","Support prioritaire"]'),
  ('Agence', 29, 249, '#7c3aed', null, '["Tout le plan Pro","Multi-utilisateurs","Espaces clients","Analytics avancées","API & Webhooks","Account manager"]')
on conflict do nothing;

-- Seed feature flags
insert into public.feature_flags (key, label, status, rollout_percent) values
  ('analytics_page',   'Page Analytics',           'on',      100),
  ('journal_page',     'Journal d''activité',       'on',      100),
  ('import_csv',       'Import CSV/Excel',          'rollout',  50),
  ('email_direct',     'Email direct prospects',    'off',        0),
  ('kanban_view',      'Vue Kanban',                'on',      100),
  ('advanced_filters', 'Filtres avancés',           'on',      100)
on conflict do nothing;

-- Seed email templates
insert into public.email_templates (key, name, subject, body_html, variables) values
  ('welcome',        'Bienvenue',           'Bienvenue sur Sky Social CRM',        '<h1>Bienvenue {{first_name}} !</h1><p>Votre espace CRM est prêt.</p>',                         '["first_name","company_name"]'),
  ('trial_expiring', 'Essai expirant',      'Votre essai expire bientôt',          '<p>{{first_name}}, votre essai expire dans {{days}} jours. Passez au Pro !</p>',               '["first_name","days"]'),
  ('invoice',        'Facture',             'Votre facture #{{invoice_id}}',        '<p>Merci {{first_name}} pour votre paiement de {{amount}}€.</p>',                              '["first_name","invoice_id","amount"]'),
  ('reset_password', 'Réinitialisation MDP','Réinitialisez votre mot de passe',    '<p>Cliquez ici pour réinitialiser votre mot de passe : <a href="{{link}}">Réinitialiser</a></p>', '["link"]')
on conflict do nothing;
