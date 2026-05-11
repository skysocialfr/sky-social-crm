-- ============================================================
-- Seed: Photopya (Michaël) custom fields schema
-- ============================================================
-- One-shot UPDATE to install the 5 rubriques requested by Michaël
-- for his photographer/videographer marketplace CRM.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor for the Velmio project.
--   2. Verify the email in the WHERE clause matches Michaël's account
--      (currently michaelmitwari@gmail.com).
--   3. Paste the whole script and click "Run".
--   4. The script is idempotent — running it twice just rewrites the
--      same schema, no duplication. Existing prospects keep their
--      already-filled custom_data values.
--
-- The IDs below are generated at runtime via gen_random_uuid() so the
-- script can be re-run on different environments (staging, prod)
-- without UUID collisions, but each run will produce DIFFERENT ids.
-- The field "key" values are stable — they're what's used to look up
-- prospect.custom_data, so those MUST NOT change once prospects start
-- filling them in.

with target_user as (
  select id from auth.users where email = 'michaelmitwari@gmail.com' limit 1
)
update public.user_profiles up
set custom_fields_schema = jsonb_build_object(
  'sections', jsonb_build_array(

    -- 1) Informations principales --------------------------------------
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Informations principales',
      'position', 0,
      'fields', jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'specialty',         'label', 'Spécialité principale',  'type', 'select',
          'options', jsonb_build_array('Photographie', 'Vidéographie', 'Montage')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'subcategories',     'label', 'Sous-catégories',        'type', 'multiselect',
          'options', jsonb_build_array('Mariage', 'Corporate', 'Événementiel', 'Portrait', 'Immobilier')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'company_legal',     'label', 'Entreprise (raison sociale)', 'type', 'text'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'siret',             'label', 'SIRET',                  'type', 'text'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'service_zone',      'label', 'Zone d''intervention',   'type', 'text'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'experience_years',  'label', 'Années d''expérience',   'type', 'number', 'min', 0, 'max', 60)
      )
    ),

    -- 2) Portfolio et visibilité ---------------------------------------
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Portfolio et visibilité',
      'position', 1,
      'fields', jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'portfolio_photos',  'label', 'Photos portfolio (nombre)', 'type', 'number', 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'portfolio_videos',  'label', 'Vidéos portfolio (nombre)', 'type', 'number', 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'bio_complete',      'label', 'Bio complétée',          'type', 'boolean'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'profile_picture',   'label', 'Photo de profil',        'type', 'boolean'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'certifications',    'label', 'Certifications',         'type', 'textarea'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'equipment',         'label', 'Équipement',             'type', 'textarea')
      )
    ),

    -- 3) Performance commerciale ---------------------------------------
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Performance commerciale',
      'position', 2,
      'fields', jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'rating_avg',        'label', 'Note moyenne (1-5)',     'type', 'number', 'min', 1, 'max', 5),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'review_count',      'label', 'Nombre d''avis',         'type', 'number', 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'response_rate',     'label', 'Taux de réponse (%)',    'type', 'number', 'min', 0, 'max', 100),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'response_time_h',   'label', 'Temps de réponse moyen (h)', 'type', 'number', 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'conversion_rate',   'label', 'Taux de conversion (%)', 'type', 'number', 'min', 0, 'max', 100),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'bookings_total',    'label', 'Nombre de réservations', 'type', 'number', 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'revenue_generated', 'label', 'CA généré',              'type', 'number', 'isCurrency', true, 'min', 0),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'commission_paid',   'label', 'Commission versée',      'type', 'number', 'isCurrency', true, 'min', 0)
      )
    ),

    -- 4) Abonnement ----------------------------------------------------
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Abonnement',
      'position', 3,
      'fields', jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'subscription_type', 'label', 'Type d''abonnement',     'type', 'select',
          'options', jsonb_build_array('Gratuit', 'Premium', 'Premium+')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'subscription_start','label', 'Date début abonnement',  'type', 'date'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'subscription_renewal','label', 'Date de renouvellement','type', 'date'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'payment_method',    'label', 'Moyen de paiement',      'type', 'select',
          'options', jsonb_build_array('CB', 'Virement', 'Autre')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'payment_history',   'label', 'Historique paiements',   'type', 'textarea')
      )
    ),

    -- 5) Badges et statuts ---------------------------------------------
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Badges et statuts',
      'position', 4,
      'fields', jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'badge',             'label', 'Badge',                  'type', 'select',
          'options', jsonb_build_array('Nouveau', 'Vérifié', 'Top Pro', 'Super Pro')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'status',            'label', 'Statut',                 'type', 'select',
          'options', jsonb_build_array('Actif', 'En attente', 'Suspendu', 'Désinscrit')),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'kyc_validated',     'label', 'KYC validé',             'type', 'boolean'),
        jsonb_build_object('id', gen_random_uuid()::text, 'key', 'iban_registered',   'label', 'IBAN renseigné (MangoPay)', 'type', 'boolean')
      )
    )

  )
)
from target_user
where up.id = target_user.id
returning up.id, jsonb_array_length(up.custom_fields_schema->'sections') as section_count;

-- Expected output: 1 row with section_count = 5.
-- If 0 rows: Michaël hasn't signed up yet OR the email doesn't match.
