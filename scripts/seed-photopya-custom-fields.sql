-- ============================================================
-- Seed: Photopya (Michaël) custom fields schema — tab-aware
-- ============================================================
-- Sets up Michaël's 5 rubriques, attaches each to the right built-in
-- tab so they show up inline next to the existing fields (no more
-- standalone "Personnalisé" tab). Also relabels the built-in tabs to
-- match his marketplace vocabulary and hides the few native fields
-- that don't apply to photographers (LinkedIn pro, Instagram, taille,
-- services intéressés…).
--
-- How to run: paste in Supabase Dashboard → SQL Editor, click Run.
-- Idempotent — re-runnable any time, no duplication.

with target_user as (
  select id from auth.users where email = 'michaelmitwari@gmail.com' limit 1
)
update public.user_profiles up
set custom_fields_schema = jsonb_build_object(

  -- Per-tab config: label override + hidden native fields
  'tabs', jsonb_build_object(
    'company', jsonb_build_object(
      'label', 'Prestataire',
      'hidden_fields', jsonb_build_array('company_size', 'linkedin_url', 'instagram_url', 'google_maps_url')
    ),
    'contact', jsonb_build_object(
      'hidden_fields', jsonb_build_array()
    ),
    'crm', jsonb_build_object(
      'label', 'Suivi & abonnement',
      'hidden_fields', jsonb_build_array('services_interested')
    )
  ),

  -- 5 sections, attached to the relevant tab
  'sections', jsonb_build_array(

    -- 1) "Informations principales" → onglet Prestataire (company)
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Informations principales',
      'tab', 'company',
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

    -- 2) "Portfolio et visibilité" → onglet Prestataire (company)
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Portfolio et visibilité',
      'tab', 'company',
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

    -- 3) "Performance commerciale" → onglet Suivi (crm)
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Performance commerciale',
      'tab', 'crm',
      'position', 0,
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

    -- 4) "Abonnement" → onglet Suivi (crm)
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Abonnement',
      'tab', 'crm',
      'position', 1,
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

    -- 5) "Badges et statuts" → onglet Suivi (crm)
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'label', 'Badges et statuts',
      'tab', 'crm',
      'position', 2,
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
