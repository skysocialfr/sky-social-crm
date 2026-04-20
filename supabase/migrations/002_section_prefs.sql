-- Add section preferences column to user_profiles
alter table user_profiles
  add column if not exists section_prefs jsonb default '{
    "show_followup": true,
    "show_interactions": true,
    "show_services": true,
    "show_deal": true,
    "show_social": true
  }'::jsonb;
