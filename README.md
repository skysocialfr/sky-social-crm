# Velmio CRM

CRM de prospection pour agences et freelances. En ligne sur [app.velmiocrm.com](https://app.velmiocrm.com).

## Stack

- **Front** : React 18 + Vite + TypeScript, Tailwind, TanStack Query, React Router
- **Back** : Supabase (Postgres + RLS, Auth, Edge Functions), Stripe (abonnements), Resend (emails)
- **Hébergement** : GitHub Pages (déploiement automatique à chaque push sur `main`)

## Développer en local

```bash
npm install
cp .env.example .env   # puis renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

Vérifications : `npm run typecheck` · `npm test` · `npm run build`

## Déployer

| Quoi | Comment |
|---|---|
| Front | automatique : push sur `main` → GitHub Actions → Pages |
| Edge Functions | automatique si le secret `SUPABASE_ACCESS_TOKEN` est défini dans GitHub → sinon, à la main : `supabase functions deploy --project-ref dolkasdiajfhvfdoawxc` **depuis ce dossier** |
| Migrations SQL | à la main : coller le fichier `supabase/migrations/NNN_*.sql` dans l'éditeur SQL de Supabase, dans l'ordre |

Le `WARNING: Docker is not running` affiché par le CLI Supabase est sans conséquence.

## Edge Functions

| Fonction | Rôle | Appelée par |
|---|---|---|
| `create-checkout` | ouvre une session Stripe Checkout | l'app |
| `create-portal-session` | ouvre le portail client Stripe | l'app |
| `stripe-webhook` | met à jour `subscriptions` | Stripe |
| `send-prospect-email` | email direct à un prospect via Resend | l'app |
| `invite-teammate` | crée l'invitation et envoie le mail | l'app |
| `accept-team-invite` | rattache l'invité à l'équipe | l'app |
| `send-notification-digest` | relances du jour (quotidien) et récap hebdo (lundi) | `pg_cron` — migration 014 |

Toutes vérifient elles-mêmes l'identité de l'appelant (`verify_jwt = false` dans `supabase/config.toml`, voir le commentaire qui explique pourquoi).

Secrets attendus côté Supabase : `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `STRIPE_*`, `CRON_SECRET` (digest), `APP_URL` (optionnel, défaut `https://app.velmiocrm.com`).

## Structure

```
src/
  pages/          une page par route (+ admin/, legal/)
  components/     par domaine : prospects, prospect-detail, settings, dashboard…
  hooks/          accès données (TanStack Query + Supabase)
  lib/            logique pure et testée : scopes, filtres, CSV, plans…
  types/          modèle de données
supabase/
  migrations/     schéma, à appliquer dans l'ordre
  functions/      Edge Functions (Deno)
```
