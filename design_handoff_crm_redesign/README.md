# Handoff — Sky Social CRM (refonte UI/UX complète)

## 📌 Vue d'ensemble

Refonte complète de l'interface du CRM **Sky Social CRM** (codebase existante : React + Vite + Tailwind + Supabase, dossier `sky-social-crm/`).

L'objectif est d'élever l'expérience au niveau des CRM pro modernes (Pipedrive, HubSpot) en gardant **toute la logique métier existante**. La structure de routes, les hooks, le store Zustand, les types et l'intégration Supabase **ne changent pas**. Seules les pages, composants UI et styles sont à reprendre.

---

## ⚠️ À propos des fichiers de ce bundle

Les fichiers du dossier `prototype/` sont des **maquettes HTML/React inline en Babel** créées comme références visuelles et interactives. **Ce ne sont pas des fichiers à copier-coller directement** dans la codebase.

La mission est de **recréer ces designs à l'identique dans le projet React existant** (`sky-social-crm/`), en utilisant :
- Les composants, hooks, et patterns déjà en place (`useProspectsStore`, `react-router-dom`, `@hello-pangea/dnd`, `recharts`, `date-fns`, `lucide-react`, etc.)
- Tailwind CSS (configuré via `tailwind.config.js` et `src/index.css`)
- TypeScript + types existants dans `src/types/index.ts`

Tous les noms de pages, routes, et types existent déjà — il s'agit de **remplacer le contenu et le style** des fichiers `src/pages/*.tsx` et `src/components/**/*.tsx`.

---

## 🎯 Niveau de fidélité

**High-fidelity (hifi)** — pixel-perfect. Les mocks définissent :
- couleurs exactes (hex)
- typographie (Plus Jakarta Sans 400/500/600/700/800)
- espacements, border-radius, ombres
- micro-interactions (hover, click, transitions)
- copy en français exact à reprendre

Le développeur doit se rapprocher au plus près du rendu, en utilisant Tailwind + des `style={{}}` quand nécessaire.

---

## 🗺 Pages / Écrans à recréer

### App principale (desktop) — fichier source : `prototype/Sky Social CRM Redesign.html`

Charge dans cet ordre : `crm-data.js` → `crm-layout.jsx` → `crm-pages-a.jsx` → `crm-pages-b.jsx` → `crm-dashboard-v3.jsx` (le v3 réécrit `DashboardPage`).

Pages à recréer dans `src/pages/` :

| Page existante | Fichier mock à reprendre | Composant principal mock |
|---|---|---|
| `DashboardPage.tsx` | `crm-dashboard-v3.jsx` (la version v3) | `window.DashboardPage` |
| `ProspectsPage.tsx` | `crm-pages-a.jsx` | `ProspectsPage` |
| `ProspectDetailPage.tsx` | `crm-pages-b.jsx` | `ProspectDetailPage` |
| `RelancesPage.tsx` | `crm-pages-b.jsx` | `RelancesPage` |
| **NOUVEAU `JournalPage.tsx`** | `crm-pages-b.jsx` | `JournalPage` |
| **NOUVEAU `AnalyticsPage.tsx`** | `crm-pages-b.jsx` | `AnalyticsPage` |
| `SettingsPage.tsx` | `crm-pages-b.jsx` | `SettingsPage` |
| `LandingPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx` | `prototype/Sky Social CRM - Auth & Landing.html` | sections de la même HTML |
| **NOUVEAU `/admin/*` (console super-admin)** | `prototype/Sky Social CRM - Admin.html` | voir section Admin ci-dessous |

Layout à reprendre dans `src/components/layout/` :
| Composant | Fichier mock |
|---|---|
| `Sidebar.tsx` | `crm-layout.jsx` → `Sidebar` |
| `TopBar.tsx` | `crm-layout.jsx` → `TopBar` |
| `AppShell.tsx` | structure dans le rendu de `App` du HTML |

---

### 1. Tableau de bord (`DashboardPage`)

**Source : `crm-dashboard-v3.jsx`** (c'est CE fichier qui définit le dashboard final, pas la version dans `crm-pages-a.jsx`).

**Layout (de haut en bas)** :
1. **Bandeau de bienvenue** — carte blanche avec :
   - Avatar utilisateur (52×52, rond)
   - "Bonjour/Bon après-midi/Bonsoir, {prénom} 👋" (18px, weight 800)
   - Sous-titre dynamique : "Vous avez X relances en retard, Y à faire aujourd'hui, Z deals chauds à suivre" (12px, segments colorés)
   - 2 boutons à droite : "📅 Mes relances" (outline) et "+ Nouveau prospect" (primary indigo)
2. **Bandeau d'alerte rouge** (si relances en retard > 0) — cliquable, navigue vers Relances
3. **4 KPIs** (grid 4 colonnes) — chacun avec : label uppercase 11px, valeur 28px weight 800, sub-label 11px, sparkline mini-area (70×22px), badge tendance ↑/↓ coloré
   - Prospects actifs (indigo)
   - Revenus potentiels (vert)
   - Taux de conversion (violet)
   - Deals chauds (rouge)
4. **Objectif + Graphique revenus** (grid 1fr / 2fr) :
   - Carte objectif (gradient `linear-gradient(135deg, #6366f1, #4f52d4 55%, #3730a3)`) avec barre de progression jaune→blanc, 3 stats footer (deals gagnés, jours restants, rythme/jour)
   - Graphique en barres revenus gagnés vs pipeline sur 7 mois, dernière barre en vert avec tooltip
5. **Deals chauds + Performance équipe** (grid 3fr / 2fr) :
   - **HotDealsCard** : top 4 deals chauds non gagnés/perdus, triés par valeur. Chaque ligne : avatar 40×40 rond + badge 🔥, nom contact + société, étape + score, valeur en € à droite
   - **TeamCard** : leaderboard équipe (4 membres), médailles 🥇🥈🥉, avatars 34×34 avec point vert "online", barre de progression revenus, % winrate, total revenus en k€
6. **Tâches du jour + Activité récente** (grid 2fr / 3fr) :
   - **TasksCard** : 4 relances avec checkbox + avatar prospect + badge "En retard" (rouge) ou "Aujourd'hui" (ambre)
   - **ActivityV3** : 5 dernières interactions, avatar prospect 36×36 + badge d'icône d'interaction en bas-droite (📞💼📧🤝📸), badge outcome coloré

**Tokens** :
```
--bg: #f4f6ff      (fond app)
--card: #ffffff
--border: #e4e7f8
--primary: #6366f1
--primary-light: rgba(99,102,241,0.08)
--primary-border: rgba(99,102,241,0.2)
--text: #1a1c2e
--muted: #6b7280
--subtle: #9ca3af
--green: #16a34a   --green-light: rgba(22,163,74,0.08)
--amber: #d97706   --amber-light: rgba(217,119,6,0.08)
--red: #dc2626     --red-light: rgba(220,38,38,0.07)
--violet: #7c3aed
--pink: #db2777
--blue: #2563eb
border-radius cartes : 14px
shadow cartes : 0 1px 4px rgba(99,102,241,0.06)
```

**Avatars** : utilisez **DiceBear notionists-neutral** (illustrés, génériques, conformes RGPD) :
```
https://api.dicebear.com/7.x/notionists-neutral/svg?seed=<NOM>&backgroundColor=c0aede,b6e3f4,d1d4f9,ffd5dc,ffdfbf,c0e5c8&radius=50
```
Helper côté React : `const avatar = (name: string) => \`https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,b6e3f4,d1d4f9,ffd5dc,ffdfbf,c0e5c8&radius=50\``

Stocker l'URL avatar dans le record Supabase (champ `avatar_url`) pour ne pas regénérer à chaque rendu.

---

### 2. Prospects (`ProspectsPage`)

**Source : `crm-pages-a.jsx` → `ProspectsPage`**

**Vues** : Table (par défaut) + Kanban (toggle en haut à droite). Conserver `@hello-pangea/dnd` pour le Kanban (déjà présent).

**Barre de filtres** (haut de page) :
- Recherche texte (input avec icône 🔍)
- Sélecteur étape, sélecteur priorité, sélecteur canal
- **Bouton "⚡ Filtres avancés"** ouvrant le panneau `AdvancedFilterPanel` (voir `crm-pages-a.jsx` lignes ~210-360)
- Toggle Table / Kanban
- Bouton "+ Nouveau prospect"

**Filtres avancés** : système de conditions multiples (champ + opérateur + valeur) joints en ET. Champs : Priorité, Étape, Canal, Valeur du deal, Score de lead, Secteur, Ville, Prochain contact. Présets enregistrés ("Chauds sans relance", "Pipeline actif", "LinkedIn > 5k€"). Possibilité d'enregistrer un nouveau filtre.

**Table** :
- Colonnes : checkbox, Société + Contact (avec avatar 32×32), Étape (badge coloré), Priorité (badge), Canal (icône + texte), Valeur (€), Score (barre + chiffre), Prochain contact, Actions
- Lignes cliquables → ouvrent `ProspectDetailPage`

**Kanban** :
- 7 colonnes (Identifié, 1er contact, Réponse reçue, RDV fixé, Devis envoyé, En négociation, Gagné)
- Cartes draggables avec : société, contact, valeur, badge priorité, score
- Drop entre colonnes met à jour `stage`

---

### 3. Détail prospect (`ProspectDetailPage`)

**Source : `crm-pages-b.jsx` → `ProspectDetailPage`**

Layout 2 colonnes :
- **Gauche (1fr)** : photo grande, nom, titre, société, badges (étape, priorité), score visuel, infos contact (email, tél, ville, secteur), boutons actions (Appeler, Email, LinkedIn, Modifier)
- **Droite (2fr)** : timeline d'interactions (cards verticales avec icône, type, date, résumé, outcome, prochaine étape), formulaire d'ajout d'interaction en bas

---

### 4. Relances (`RelancesPage`)

**Source : `crm-pages-b.jsx` → `RelancesPage`**

**Toggle Liste / Calendrier** en haut à droite.

**Vue Liste** : sections "En retard" (rouge), "Aujourd'hui" (ambre), "À venir" (gris). Chaque ligne = card avec avatar + nom + société + étape + date + actions (✓ Fait, ⏰ Reporter).

**Vue Calendrier** : grille mensuelle 7 colonnes, jour courant surligné, points colorés par jour selon priorité, modal au clic sur un jour avec liste des relances.

---

### 5. Journal (`JournalPage`) — NOUVEAU

**Source : `crm-pages-b.jsx` → `JournalPage`**

Page dédiée affichant le journal complet d'activité (toutes interactions de tous prospects, groupées par date).

- Filtres en haut : par type d'interaction (Appel, Email, LinkedIn, Réunion…), par outcome, par prospect
- Liste verticale avec groupes par jour
- Chaque entrée est dépliable au clic → affiche le **débrief complet** (champ texte multiligne `summary`) + **prochaine étape** (`next`) + bouton "Modifier le débrief"
- Bouton "+ Nouvelle entrée" en haut à droite

Schéma de données journal (à ajouter à Supabase) :
```ts
interface JournalEntry {
  id: string
  prospect_id: string
  type: 'Appel'|'LinkedIn'|'Email'|'Réunion'|'Instagram'|'Téléphone'|'Note interne'
  stage: PipelineStage
  outcome: 'Positif'|'Négatif'|'En attente'|'Tiède'|'Froid'|'Gagné'|null
  date: string  // ISO
  summary: string  // débrief libre
  next: string | null  // prochaine action prévue
  created_by: string  // user id
}
```

---

### 6. Analytics (`AnalyticsPage`) — NOUVEAU

**Source : `crm-pages-b.jsx` → `AnalyticsPage`**

KPIs avancés :
- Cycle moyen de deal (jours)
- Valeur moyenne d'un deal
- Top canal de conversion
- Graphique courbes revenus (gagné vs pipeline) sur 7 mois
- Graphique courbe taux de conversion sur 7 mois
- **Funnel détaillé** : taux de passage à chaque étape (Identifié → 1er contact 78%, etc.)

Utiliser **recharts** (déjà installé).

---

### 7. Paramètres (`SettingsPage`)

**Source : `crm-pages-b.jsx` → `SettingsPage`**

Page avec sidebar gauche listant 9 sections + contenu à droite :
1. **Mon compte** — édition prénom, nom, photo (upload), email, téléphone, fuseau horaire, langue
2. **Sécurité** — changement de mot de passe, 2FA, sessions actives, déconnexion partout
3. **Notifications** — toggles par canal (email, push, in-app) et par type d'événement
4. **Apparence** — thème (clair/sombre/auto), densité, langue d'interface
5. **Intégrations** — Gmail, LinkedIn, Calendar, Slack, Zapier (boutons connecter/déconnecter)
6. **Abonnement** — plan actuel, prochaine facture, historique, upgrade
7. **Équipe** — liste des membres avec rôles, invitation par email, gestion des permissions
8. **Données** — export CSV, import CSV, suppression du compte
9. **API & Webhooks** — clés API, gestion des webhooks

---

### 8. Auth & Landing (`LandingPage`, `LoginPage`, `RegisterPage`)

**Source : `prototype/Sky Social CRM - Auth & Landing.html`**

3 sections dans le même fichier (toggle en haut). Style **clair, vivide, premium** — assorti à l'app, pas le dark mode actuel.

**Landing** :
- Hero : titre 64px, sous-titre, 2 CTA, capture du dashboard à droite
- Section bénéfices (3 ou 4 cartes avec icône)
- Section social proof
- Pricing (3 plans)
- Footer

**Login** :
- Card centrée, logo, "Bon retour", champs email + mot de passe (avec œil), case "Se souvenir", bouton "Se connecter" indigo, lien mot de passe oublié, divider, boutons SSO Google/LinkedIn, lien "Pas encore de compte ?"

**Register** :
- Wizard 2 étapes (infos perso → infos société), barre de progression, validation en temps réel, mêmes styles

---

### 9. Console super-admin SaaS (`/admin/*`) — NOUVEAU

**Source : `prototype/Sky Social CRM - Admin.html`** + `admin-data.js` + `admin-layout.jsx` + `admin-pages-a.jsx` + `admin-pages-b.jsx`

Espace **réservé au propriétaire de la plateforme** (vous, Founder) — permet de monitorer le SaaS dans son ensemble : tous les comptes clients, la facturation globale, les métriques produit. **Pas un espace admin d'organisation** (qui existe déjà dans Settings → Équipe pour les Owners de chaque org cliente).

**Accès** :
- Route protégée `/admin/*` dans la même app React
- Garde d'accès : un seul rôle `super_admin` (à ajouter dans le profil utilisateur Supabase ou via la table `admins(user_id)` séparée). Toute requête `/admin/*` vérifie ce rôle, sinon → redirection 404
- **NE PAS** afficher de lien vers `/admin` dans la sidebar de l'app cliente. Accès direct par URL uniquement
- Pour vous, ajoutez votre user_id dans la table `admins` lors du seed initial

**Look** : strictement le même que l'app cliente (indigo `#6366f1`, fond `#f4f6ff`, Plus Jakarta Sans, cartes blanches border-radius 14, ombres 0 1px 4px rgba(99,102,241,0.06)). Mais petite différence : un **bandeau "Admin · Console interne"** uppercase 11px indigo en haut de chaque page pour marquer la zone, et la sidebar a son propre branding "Sky Social — Console Admin" + carte d'état système (uptime, latence API).

**Sidebar admin** (240px, regroupée en 4 sections) :
- **Plateforme** → Vue d'ensemble
- **Clients** → Organisations, Utilisateurs
- **Revenus** → Facturation
- **Système** → Configuration, Emails, Annonces

#### 9.1 Vue d'ensemble (`/admin`)

Layout :
1. **4 KPIs hero** (grid 4 colonnes) : MRR (avec ARR en sub), Utilisateurs actifs, Taux de churn (sous-titre NRR), Nouveaux inscrits 30j. Chaque KPI : valeur 28px weight 800, sparkline 100×32px à droite, badge tendance ↑/↓ (le sens "good" du churn est inversé).
2. **Évolution MRR (2/3) + Répartition par plan (1/3)** : bar chart 12 mois (la dernière barre en gradient indigo plus foncé), camembert remplacé par 4 barres de progression colorées par plan
3. **Top fonctionnalités utilisées (3/5) + À surveiller (2/5)** :
   - Top features : 6 lignes avec barre de progression `linear-gradient(90deg, #6366f1, #8b5cf6)` et tendance %
   - Alertes : paiements échoués (rouge), factures en retard (ambre), essais qui expirent (indigo), candidats upgrade (vert) — chacune avec icône, titre, description et CTA `→`
4. **4 stats secondaires** : ARPU, LTV, CAC, **LTV/CAC ratio** (cette dernière en carte gradient indigo `linear-gradient(135deg, #6366f1, #4f52d4)` pour la mettre en valeur — c'est la métrique de santé business clé)

Toggle période en topbar : `7j / 30j / 90j / 12m` (segmented control).

#### 9.2 Organisations (`/admin/orgs`)

Table avec filtres : recherche texte, filtre Plan, filtre Statut, bouton Export CSV.

Colonnes : checkbox, **Organisation** (logo 36×36 DiceBear shapes + nom + drapeau pays + propriétaire + secteur), **Plan** (badge Pro/Business/Enterprise), **Statut** (badge avec dot : Actif/Trial/Past Due/Suspendu), **MRR** (€), **Sièges** (utilisés/total + barre), **Prospects** (nombre), **Inscription** (date), **Activité** (relatif : "Il y a 2 min"), Actions (`⋯`).

Clic sur ligne → page de détail org (à créer ultérieurement).

Logo helper : `https://api.dicebear.com/7.x/shapes/svg?seed=<nom>&backgroundColor=6366f1,8b5cf6,06b6d4,22c55e,f59e0b,ec4899&radius=10`

#### 9.3 Utilisateurs (`/admin/users`)

Vue cross-org de **tous** les utilisateurs de la plateforme. Table avec recherche + filtre Statut.

Colonnes : checkbox, **Utilisateur** (avatar + nom + email), **Organisation**, **Rôle** (badge Owner/Admin/Member), **Statut**, **Dernière activité**, **Inscription**, **Actions** :
- 👁 **Impersonate** (le plus important — permet de se connecter "en tant que" un user pour debug/support — implémenter via JWT impersonate token côté Supabase)
- ✉ Envoyer email
- ⊘ Suspendre (rouge)

#### 9.4 Facturation (`/admin/billing`)

1. **4 KPIs** : MRR, ARR projeté, Encaissé ce mois, **En souffrance** (carte rouge si > 0)
2. **Graphique évolution MRR 12 mois** (réutiliser le composant du dashboard)
3. **Table factures récentes** avec : N° facture (mono), Org, Date, Méthode (Carte ••XXXX / SEPA), Statut, Montant, Actions (↓ télécharger PDF, ↻ relancer si non payée)

Données via Stripe webhooks → table `invoices` Supabase.

#### 9.5 Configuration (`/admin/config`)

3 onglets en pills indigo :

**Plans & tarifs** : 4 cartes plans côte à côte (Starter / Pro / Business / Enterprise). Chaque carte : nom, badge Public/Sur demande, prix mensuel + annuel, bloc abonnés/MRR, liste features avec ✓ coloré, boutons Modifier / Désactiver. Bouton "+ Nouveau plan" en haut.

**Feature flags** : table avec Clé (code mono), Description, Statut (Production/Beta/Alpha/Désactivé), Plans concernés (badges), **Rollout %** (barre de progression — vert si 100%, indigo sinon), Actions Modifier. Bouton "+ Nouveau flag".

**Paramètres généraux** : 4 cartes (Inscription / Sécurité / Limites & quotas / Maintenance), chacune avec lignes label + toggle/select/text. Zone "Maintenance" inclut un encart rouge "⚠️ Zone dangereuse" pour le toggle `maintenance_mode`.

**Schéma DB nécessaire** :
```ts
plans: id, name, monthly_price, yearly_price, color, features (jsonb), seats_limit, prospects_limit, active, public, created_at
feature_flags: key (pk), label, status, rollout_percent, plans (jsonb array), updated_at
platform_settings: key (pk), value (jsonb), description, updated_at
```

#### 9.6 Emails transactionnels (`/admin/emails`)

Layout 2 colonnes (380px / reste) :
- **Gauche** : liste des 8 templates avec icône ✉, nom, sujet, stats d'envoi (📤 nombre) et ouverture (👁 % vert si >70 sinon ambre). Le sélectionné a un border-left indigo + fond `#f4f6ff`
- **Droite** : détail du template sélectionné — header (clé + nom + date modif), boutons Tester / Modifier, **3 mini-stats** (envoyés / taux d'ouverture / plaintes), puis **preview live** rendu dans une "boîte mail" (fond gris clair, carte blanche centrée 520px max-width avec header "Sky Social CRM" + meta "De / À" + sujet + corps + bouton CTA indigo)

Templates inclus : welcome, trial_ending (J-3), trial_expired, invoice_paid, invoice_failed, password_reset, invitation, monthly_summary.

Variables : `{{number}}`, `{{inviter}}`, `{{org}}`, `{{month}}`, `{{user_name}}`. Utiliser **Mustache** ou **Handlebars** côté serveur (Edge Function Supabase) pour le rendu, et **Resend** ou **Postmark** comme provider.

**Schéma DB** :
```ts
email_templates: key (pk), name, subject, body_html, body_text, variables (jsonb), enabled, last_edit
email_sends: id, template_key, to_email, sent_at, opened_at, clicked_at, bounced
```

#### 9.7 Annonces / Changelog (`/admin/changelog`)

Timeline verticale (max-width 920px). Chaque annonce :
- Pastille colorée à gauche (indigo=Nouveau, vert=Amélioration, ambre=Correctif, gris=À venir) reliée par une ligne verticale gradient
- Card avec : badge type + version (mono) + date + auteur + badge "BROUILLON" si non publié, titre 16px weight 800, body 13px gris, footer stats si publié (vues / réactions / envois)
- Actions ✎ Modifier, ⧉ Dupliquer

Cette page sert aussi à **publier** les annonces qui apparaissent dans l'app cliente (popover "Quoi de neuf 🎉" dans la TopBar des users).

**Schéma DB** :
```ts
changelog_entries: id, version, date, tag (Nouveau|Amélioration|Correctif|À venir), title, body_md, author_id, published, published_at, created_at
changelog_views: entry_id, user_id, viewed_at  -- pour stats vues
```

---

### 10. Mobile (`Sky Social CRM - Mobile.html`)

5 écrans iOS dans un cadre iPhone :
- Dashboard (KPIs 2×2, objectif, top deals)
- Prospects (liste avec recherche en haut, filtres pills, items avec avatar)
- Détail prospect (header + actions + timeline)
- Relances (liste avec sections)
- Journal (liste avec filtres pills)

Cible : React Native ou PWA responsive selon votre stack mobile.

---

## 🎬 Interactions & comportement

- **Transitions hover sur cartes/lignes** : `transition: background 0.15s, border-color 0.15s` ; au survol, fond `#f7f8ff` ou border `var(--border)`
- **Boutons primary** : `box-shadow: 0 2px 8px rgba(99,102,241,0.55)` en hover
- **Sparklines** : entrée animée `transition: width 0.8s ease` ou `height 0.9s`
- **Drag & drop Kanban** : lib `@hello-pangea/dnd` (déjà installée), card scale 1.02 + shadow plus marquée pendant le drag
- **Recherche globale** : raccourci `⌘K` / `Ctrl+K` ouvre une modale de recherche (palette de commandes)
- **Toggles vue (Table/Kanban, Liste/Calendrier)** : sauvegardés dans `localStorage`
- **Toasts** : composant `react-hot-toast` (déjà installé) pour les confirmations (deal gagné, relance reportée, etc.)

---

## 🗃 État (Zustand)

Le store existant `useProspectsStore` doit gérer en plus :
```ts
interface JournalState {
  entries: JournalEntry[]
  addEntry(entry: Omit<JournalEntry,'id'|'created_by'>): Promise<void>
  updateEntry(id: string, patch: Partial<JournalEntry>): Promise<void>
  deleteEntry(id: string): Promise<void>
  fetchEntries(prospectId?: string): Promise<void>
}
```

Filtres sauvegardés (localStorage) :
```ts
interface SavedFilter {
  id: string
  name: string
  conditions: FilterCondition[]
  createdAt: string
}
```

---

## 🎨 Design tokens (résumé)

```css
/* tailwind.config.js — extend */
colors: {
  bg: '#f4f6ff',
  card: '#ffffff',
  border: '#e4e7f8',
  text: '#1a1c2e',
  muted: '#6b7280',
  subtle: '#9ca3af',
  primary: { DEFAULT: '#6366f1', hover: '#4f52d4', light: 'rgba(99,102,241,0.08)' },
  green:  { DEFAULT: '#16a34a', light: 'rgba(22,163,74,0.08)' },
  amber:  { DEFAULT: '#d97706', light: 'rgba(217,119,6,0.08)' },
  red:    { DEFAULT: '#dc2626', light: 'rgba(220,38,38,0.07)' },
  blue:   '#2563eb',
  pink:   '#db2777',
  violet: '#7c3aed',
}
borderRadius: { card: '14px', btn: '9px', pill: '20px' }
boxShadow: { card: '0 1px 4px rgba(99,102,241,0.06)', primary: '0 2px 8px rgba(99,102,241,0.55)' }
fontFamily: { sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] }
```

**Typographie** :
- Plus Jakarta Sans (Google Fonts) — poids 400, 500, 600, 700, 800
- Tailles : 11 (label/sub), 12 (body small), 13 (body), 14 (default), 15-16 (cards titles), 18 (h3), 22-26 (h2 / KPI value), 28 (h2 large), 32+ (hero)

---

## 🖼 Assets

- **Avatars** : DiceBear notionists-neutral (URL helper ci-dessus). Remplacer par photos réelles si disponibles dans Supabase Storage.
- **Icônes** : `lucide-react` (déjà installé) pour tout. Les emojis dans les mocks (📞 💼 📧 🤝 🔥 ⚠️) peuvent être remplacés par les icônes Lucide équivalentes (`Phone`, `Linkedin`, `Mail`, `Handshake`, `Flame`, `AlertTriangle`).
- **Polices** : Plus Jakarta Sans via Google Fonts (`<link>` dans `index.html`).
- **Logo** : conserver `/public/favicon.svg` existant.

---

## 📁 Fichiers du bundle

```
prototype/
  Sky Social CRM Redesign.html         # App desktop complète (entry point)
  Sky Social CRM - Auth & Landing.html # Landing + Login + Register
  Sky Social CRM - Admin.html          # Console super-admin SaaS (/admin/*) ← NOUVEAU
  Sky Social CRM - Mobile.html         # 5 écrans iOS
  admin-data.js                        # Mock data admin (orgs, users, invoices, plans, flags…)
  admin-layout.jsx                     # AdminSidebar + AdminTopBar + helpers
  admin-pages-a.jsx                    # AdminDashboard, AdminOrgs, AdminUsers, AdminBilling
  admin-pages-b.jsx                    # AdminConfig, AdminEmails, AdminChangelog
  crm-data.js                          # Mock data (prospects, journal, équipe, analytics)
  crm-layout.jsx                       # Sidebar + TopBar + Helpers
  crm-pages-a.jsx                      # Dashboard v1, Prospects, Filtres avancés
  crm-pages-b.jsx                      # ProspectDetail, Relances, Journal, Analytics, Settings
  crm-dashboard-v3.jsx                 # Dashboard FINAL (override v3) ← C'EST CELUI-CI POUR LE DASHBOARD
  ios-frame.jsx                        # Cadre iPhone (composant utilitaire de prévisualisation)
README.md                              # Ce fichier
```

---

## ✅ Critères d'acceptation

1. Toutes les pages existantes conservent leur route et leur logique métier (auth, hooks, store, supabase client)
2. Le rendu visuel se rapproche au pixel près des mocks (couleurs, espacements, typographie, ombres, border-radius)
3. Les nouvelles pages **Journal** et **Analytics** sont créées avec leur table Supabase et leurs hooks dédiés
4. Le dashboard est celui de `crm-dashboard-v3.jsx` (avec bandeau de bienvenue, leaderboard équipe, deals chauds avec avatars, etc.)
5. Les filtres avancés des Prospects fonctionnent (multi-conditions ET, présets, sauvegarde)
6. Le Kanban reste draggable
7. La vue Calendrier des relances fonctionne
8. Les pages Auth et Landing sont en thème clair (pas dark)
9. Les responsives mobile suivent les mocks `Sky Social CRM - Mobile.html`
10. La console super-admin `/admin/*` est protégée par un middleware vérifiant le rôle `super_admin` (table `admins` ou flag dans `profiles`)
11. La fonction **impersonate** dans `/admin/users` permet de se connecter en tant qu'un autre utilisateur (via Supabase JWT impersonate ou équivalent)
12. Les tables Supabase `plans`, `feature_flags`, `platform_settings`, `email_templates`, `changelog_entries` sont créées avec leurs RLS (lecture publique pour `plans` actifs/publics et `changelog_entries` publiées, sinon admin only)
13. `npm run lint` et `npm run build` passent sans erreur
