// Mock data — Admin SaaS Sky Social CRM
// Données factices simulant la plateforme côté propriétaire

const AV = (seed, style='notionists-neutral') =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,b6e3f4,d1d4f9,ffd5dc,ffdfbf,c0e5c8&radius=50`

const LOGO = (seed) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1,8b5cf6,06b6d4,22c55e,f59e0b,ec4899&radius=10`

window.ADMIN = {
  superAdmin: { name: 'Vous (Founder)', email: 'founder@skysocial.app', avatar: AV('Founder Sky') },

  // KPIs principaux plateforme
  metrics: {
    mrr: 24830,                      // €
    mrrTrend: +12.4,                 // %
    arr: 297960,
    activeUsers: 612,
    activeUsersTrend: +8.7,
    paidOrgs: 142,
    paidOrgsTrend: +15,
    trialOrgs: 38,
    trialOrgsTrend: +6,
    churn: 3.2,                      // %
    churnTrend: -0.4,                // %
    nrr: 108,                        // %
    arpu: 175,                       // €
    ltv: 5460,                       // €
    cac: 320,                        // €
    signupsToday: 7,
    signupsWeek: 41,
    signupsMonth: 168,

    // Sparkline 12 mois
    mrrSeries:    [11200, 12400, 13800, 15100, 16400, 17900, 19200, 20800, 22000, 23100, 24100, 24830],
    usersSeries:  [220, 261, 295, 332, 378, 410, 449, 491, 528, 565, 591, 612],
    churnSeries:  [4.8, 4.6, 4.5, 4.2, 4.0, 3.9, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2],
    signupSeries: [21, 28, 34, 39, 47, 52, 64, 71, 88, 102, 124, 168],

    // Répartition par plan
    planSplit: [
      { name:'Starter',      price: 29,  count: 64,  revenue: 1856,  color:'#94a3b8' },
      { name:'Pro',          price: 79,  count: 58,  revenue: 4582,  color:'#6366f1' },
      { name:'Business',     price: 199, count: 16,  revenue: 3184,  color:'#8b5cf6' },
      { name:'Enterprise',   price: 499, count: 4,   revenue: 1996,  color:'#0ea5e9' },
    ],

    // Top features utilisées (events / 30j)
    topFeatures: [
      { name:'Création prospect',    events: 18420, trend:+14 },
      { name:'Import CSV',           events: 12180, trend:+22 },
      { name:'Vue Kanban',           events: 9870,  trend:+8 },
      { name:'Filtres avancés',      events: 7421,  trend:+38 },
      { name:'Journal interaction',  events: 6890,  trend:+18 },
      { name:'Export rapport',       events: 3214,  trend:-4 },
    ],
  },

  // Organisations clientes
  orgs: [
    { id:'o1',  name:'Bento & Co',          slug:'bento-co',          logo: LOGO('Bento'),       plan:'Pro',        status:'Actif',     seats:8,  seatsUsed:7, mrr:79,  signupAt:'2025-09-12', country:'🇫🇷', industry:'Agence', owner:'Sophie Martin',     prospects:142, lastActive:"Il y a 2 min" },
    { id:'o2',  name:'Atelier Digital',     slug:'atelier-digital',   logo: LOGO('Atelier'),     plan:'Business',   status:'Actif',     seats:25, seatsUsed:18,mrr:199, signupAt:'2025-08-04', country:'🇫🇷', industry:'Agence', owner:'Romain Beaufort',   prospects:438, lastActive:"Il y a 14 min" },
    { id:'o3',  name:'GrowthLab',           slug:'growthlab',         logo: LOGO('Growth'),      plan:'Enterprise', status:'Actif',     seats:50, seatsUsed:32,mrr:499, signupAt:'2025-06-18', country:'🇧🇪', industry:'SaaS',   owner:'Pieter Vermeulen',  prospects:1284,lastActive:"Il y a 1 h" },
    { id:'o4',  name:'Studio Onze',         slug:'studio-onze',       logo: LOGO('Onze'),        plan:'Pro',        status:'Trial',     seats:3,  seatsUsed:3, mrr:0,   signupAt:'2026-04-19', country:'🇫🇷', industry:'Design', owner:'Juliette Hwang',    prospects:21,  lastActive:"Il y a 3 h" },
    { id:'o5',  name:'CrémerieFR',          slug:'cremerie-fr',       logo: LOGO('Cremerie'),    plan:'Starter',    status:'Actif',     seats:2,  seatsUsed:2, mrr:29,  signupAt:'2026-01-22', country:'🇫🇷', industry:'Retail', owner:'Émilie Roussel',    prospects:67,  lastActive:'Hier' },
    { id:'o6',  name:'Kiwi Marketing',      slug:'kiwi-mkt',          logo: LOGO('Kiwi'),        plan:'Pro',        status:'Past Due',  seats:6,  seatsUsed:4, mrr:79,  signupAt:'2025-11-30', country:'🇫🇷', industry:'Agence', owner:'Lucas Tremblay',    prospects:312, lastActive:'Il y a 4 j' },
    { id:'o7',  name:'NorthBay Co',         slug:'northbay',          logo: LOGO('Northbay'),    plan:'Business',   status:'Actif',     seats:15, seatsUsed:11,mrr:199, signupAt:'2025-10-08', country:'🇨🇦', industry:'Coaching',owner:'Daniel Okonkwo',    prospects:524, lastActive:"Il y a 28 min" },
    { id:'o8',  name:'Boucle Studio',       slug:'boucle',            logo: LOGO('Boucle'),      plan:'Pro',        status:'Trial',     seats:4,  seatsUsed:2, mrr:0,   signupAt:'2026-04-25', country:'🇫🇷', industry:'Design', owner:'Margaux Lévy',      prospects:8,   lastActive:"Il y a 12 min" },
    { id:'o9',  name:'CafetIA',             slug:'cafetia',           logo: LOGO('Cafet'),       plan:'Starter',    status:'Actif',     seats:1,  seatsUsed:1, mrr:29,  signupAt:'2026-02-14', country:'🇫🇷', industry:'SaaS',   owner:'Hugo Berthier',     prospects:34,  lastActive:'Hier' },
    { id:'o10', name:'Mainstream Médias',   slug:'mainstream',        logo: LOGO('Mainstream'),  plan:'Business',   status:'Suspendu',  seats:20, seatsUsed:0, mrr:0,   signupAt:'2025-07-11', country:'🇫🇷', industry:'Média',  owner:'Anaïs Sorrentino',  prospects:0,   lastActive:'Il y a 11 j' },
    { id:'o11', name:'TerraCotta Lab',      slug:'terracotta',        logo: LOGO('Terra'),       plan:'Enterprise', status:'Actif',     seats:80, seatsUsed:54,mrr:499, signupAt:'2025-04-02', country:'🇮🇹', industry:'SaaS',   owner:'Matteo Ferrari',    prospects:2410,lastActive:"Il y a 3 min" },
    { id:'o12', name:'Maison Verte',        slug:'maison-verte',      logo: LOGO('Maison'),      plan:'Pro',        status:'Actif',     seats:7,  seatsUsed:6, mrr:79,  signupAt:'2025-12-04', country:'🇫🇷', industry:'Bio',    owner:'Charlotte Mauresmo',prospects:189, lastActive:"Il y a 2 h" },
  ],

  // Utilisateurs (vue toutes orgs confondues)
  users: [
    { id:'u101', name:'Sophie Martin',     email:'sophie@bento-co.fr',         org:'Bento & Co',        role:'Owner', avatar: AV('Sophie Martin Owner'),    status:'Actif',     lastSeen:"Il y a 2 min",  signupAt:'2025-09-12' },
    { id:'u102', name:'Romain Beaufort',   email:'romain@atelier-digital.com', org:'Atelier Digital',   role:'Owner', avatar: AV('Romain Beaufort'),        status:'Actif',     lastSeen:"Il y a 14 min", signupAt:'2025-08-04' },
    { id:'u103', name:'Pieter Vermeulen',  email:'pieter@growthlab.io',        org:'GrowthLab',         role:'Owner', avatar: AV('Pieter Vermeulen'),       status:'Actif',     lastSeen:"Il y a 1 h",    signupAt:'2025-06-18' },
    { id:'u104', name:'Juliette Hwang',    email:'jul@studio-onze.fr',         org:'Studio Onze',       role:'Owner', avatar: AV('Juliette Hwang'),         status:'Trial',     lastSeen:"Il y a 3 h",    signupAt:'2026-04-19' },
    { id:'u105', name:'Émilie Roussel',    email:'emilie@cremerie.fr',         org:'CrémerieFR',        role:'Owner', avatar: AV('Emilie Roussel'),         status:'Actif',     lastSeen:'Hier',          signupAt:'2026-01-22' },
    { id:'u106', name:'Lucas Tremblay',    email:'lucas@kiwi-mkt.com',         org:'Kiwi Marketing',    role:'Owner', avatar: AV('Lucas Tremblay'),         status:'Past Due',  lastSeen:'Il y a 4 j',    signupAt:'2025-11-30' },
    { id:'u107', name:'Daniel Okonkwo',    email:'daniel@northbay.co',         org:'NorthBay Co',       role:'Owner', avatar: AV('Daniel Okonkwo'),         status:'Actif',     lastSeen:"Il y a 28 min", signupAt:'2025-10-08' },
    { id:'u108', name:'Margaux Lévy',      email:'margaux@boucle.studio',      org:'Boucle Studio',     role:'Owner', avatar: AV('Margaux Levy'),           status:'Trial',     lastSeen:"Il y a 12 min", signupAt:'2026-04-25' },
    { id:'u109', name:'Hugo Berthier',     email:'hugo@cafetia.app',           org:'CafetIA',           role:'Owner', avatar: AV('Hugo Berthier'),          status:'Actif',     lastSeen:'Hier',          signupAt:'2026-02-14' },
    { id:'u110', name:'Anaïs Sorrentino',  email:'anais@mainstream.fr',        org:'Mainstream Médias', role:'Owner', avatar: AV('Anais Sorrentino'),       status:'Suspendu',  lastSeen:'Il y a 11 j',   signupAt:'2025-07-11' },
    { id:'u111', name:'Matteo Ferrari',    email:'matteo@terracotta.it',       org:'TerraCotta Lab',    role:'Owner', avatar: AV('Matteo Ferrari'),         status:'Actif',     lastSeen:"Il y a 3 min",  signupAt:'2025-04-02' },
    { id:'u112', name:'Charlotte Mauresmo',email:'charlotte@maisonverte.fr',   org:'Maison Verte',      role:'Owner', avatar: AV('Charlotte Mauresmo'),     status:'Actif',     lastSeen:"Il y a 2 h",    signupAt:'2025-12-04' },
    { id:'u113', name:'Théo Lacroix',      email:'theo@bento-co.fr',           org:'Bento & Co',        role:'Member',avatar: AV('Theo Lacroix'),           status:'Actif',     lastSeen:"Il y a 18 min", signupAt:'2025-10-02' },
    { id:'u114', name:'Camille Nguyen',    email:'camille@atelier-digital.com',org:'Atelier Digital',   role:'Admin', avatar: AV('Camille Nguyen Admin'),   status:'Actif',     lastSeen:"Il y a 41 min", signupAt:'2025-08-15' },
    { id:'u115', name:'Olivier Caron',     email:'olivier@growthlab.io',       org:'GrowthLab',         role:'Admin', avatar: AV('Olivier Caron'),          status:'Actif',     lastSeen:'Hier',          signupAt:'2025-07-04' },
    { id:'u116', name:'Inès Bouhadi',      email:'ines@maisonverte.fr',        org:'Maison Verte',      role:'Member',avatar: AV('Ines Bouhadi'),           status:'Actif',     lastSeen:"Il y a 5 h",    signupAt:'2026-01-08' },
  ],

  // Factures récentes
  invoices: [
    { id:'INV-2026-04-1142', org:'TerraCotta Lab',   amount: 499, status:'Payée',     date:'2026-04-01', method:'Carte ••4242' },
    { id:'INV-2026-04-1141', org:'GrowthLab',        amount: 499, status:'Payée',     date:'2026-04-01', method:'Carte ••8881' },
    { id:'INV-2026-04-1140', org:'Atelier Digital',  amount: 199, status:'Payée',     date:'2026-04-01', method:'SEPA' },
    { id:'INV-2026-04-1139', org:'NorthBay Co',      amount: 199, status:'Payée',     date:'2026-04-01', method:'Carte ••0099' },
    { id:'INV-2026-04-1138', org:'Bento & Co',       amount: 79,  status:'Payée',     date:'2026-04-01', method:'Carte ••3344' },
    { id:'INV-2026-04-1137', org:'Maison Verte',     amount: 79,  status:'Payée',     date:'2026-04-01', method:'SEPA' },
    { id:'INV-2026-04-1136', org:'Kiwi Marketing',   amount: 79,  status:'En retard', date:'2026-04-01', method:'Carte ••0214' },
    { id:'INV-2026-04-1135', org:'CafetIA',          amount: 29,  status:'Payée',     date:'2026-04-01', method:'Carte ••7766' },
    { id:'INV-2026-04-1134', org:'CrémerieFR',       amount: 29,  status:'Payée',     date:'2026-04-01', method:'SEPA' },
    { id:'INV-2026-03-1102', org:'Mainstream Médias',amount: 199, status:'Échouée',   date:'2026-03-01', method:'Carte expirée' },
  ],

  // Plans (configuration)
  plans: [
    {
      id:'starter',   name:'Starter',    monthly:29,  yearly:290,  color:'#94a3b8',
      features:['1 utilisateur','100 prospects','Filtres simples','Support email'],
      seats:1, prospectsLimit:100,
      active:true, public:true, subscribers:64,
    },
    {
      id:'pro',       name:'Pro',        monthly:79,  yearly:790,  color:'#6366f1',
      features:['10 utilisateurs','5 000 prospects','Filtres avancés','Kanban + automatisations','Support prioritaire'],
      seats:10, prospectsLimit:5000,
      active:true, public:true, subscribers:58,
    },
    {
      id:'business',  name:'Business',   monthly:199, yearly:1990, color:'#8b5cf6',
      features:['30 utilisateurs','25 000 prospects','API & Webhooks','Permissions granulaires','SSO','Account manager dédié'],
      seats:30, prospectsLimit:25000,
      active:true, public:true, subscribers:16,
    },
    {
      id:'enterprise',name:'Enterprise', monthly:499, yearly:4990, color:'#0ea5e9',
      features:['Utilisateurs illimités','Prospects illimités','SSO + SCIM','SLA 99,9%','Onboarding dédié','Sécurité renforcée'],
      seats:9999, prospectsLimit:9999999,
      active:true, public:false, subscribers:4,
    },
  ],

  // Feature flags
  featureFlags: [
    { key:'kanban_v2',            label:'Kanban v2 (drag & drop avec swim lanes)',          rollout:'100%', plans:['Pro','Business','Enterprise'], status:'Production' },
    { key:'ai_summary',           label:'Résumé IA des interactions',                       rollout:'25%',  plans:['Business','Enterprise'],       status:'Beta' },
    { key:'whatsapp_integration', label:'Intégration WhatsApp Business',                    rollout:'5%',   plans:['Enterprise'],                  status:'Alpha' },
    { key:'analytics_v3',         label:'Analytics v3 — funnel + cohortes',                 rollout:'100%', plans:['Pro','Business','Enterprise'], status:'Production' },
    { key:'public_api',           label:'API publique v1',                                  rollout:'100%', plans:['Business','Enterprise'],       status:'Production' },
    { key:'mobile_app',           label:'App mobile native iOS/Android',                    rollout:'0%',   plans:['Pro','Business','Enterprise'], status:'Désactivé' },
  ],

  // Templates emails transactionnels
  emailTemplates: [
    { key:'welcome',              name:'Bienvenue',                     subject:'Bienvenue sur Sky Social CRM 🎉',                    sentMonth: 168, openRate: 78, lastEdit:'2026-04-12' },
    { key:'trial_ending',         name:'Fin d\'essai (J-3)',            subject:'Plus que 3 jours pour profiter de Pro',              sentMonth:  41, openRate: 64, lastEdit:'2026-03-20' },
    { key:'trial_expired',        name:'Essai expiré',                  subject:'Votre essai gratuit est terminé',                    sentMonth:  18, openRate: 52, lastEdit:'2026-03-20' },
    { key:'invoice_paid',         name:'Facture payée',                 subject:'Votre facture #{{number}} est payée',                sentMonth: 142, openRate: 88, lastEdit:'2026-02-04' },
    { key:'invoice_failed',       name:'Échec de paiement',             subject:'⚠️ Échec de prélèvement — action requise',           sentMonth:   3, openRate: 96, lastEdit:'2026-04-02' },
    { key:'password_reset',       name:'Réinitialisation mot de passe', subject:'Réinitialisez votre mot de passe',                   sentMonth:  64, openRate: 91, lastEdit:'2025-11-10' },
    { key:'invitation',           name:'Invitation équipe',             subject:'{{inviter}} vous invite à rejoindre {{org}}',        sentMonth: 287, openRate: 72, lastEdit:'2026-01-15' },
    { key:'monthly_summary',      name:'Résumé mensuel',                subject:'Votre mois sur Sky Social — {{month}}',              sentMonth: 612, openRate: 41, lastEdit:'2026-04-01' },
  ],

  // Annonces (changelog)
  changelog: [
    { id:'cl1', version:'2.6.0',  date:'2026-04-25', tag:'Nouveau',    title:'Filtres avancés multi-conditions',                   body:'Combinez jusqu\'à 10 conditions avec des opérateurs ET/OU. Sauvegardez vos filtres préférés et partagez-les avec votre équipe.', author:'Équipe produit', published:true },
    { id:'cl2', version:'2.5.3',  date:'2026-04-18', tag:'Amélioration', title:'Performances du Kanban x2',                          body:'Le drag & drop est désormais 2 fois plus fluide, même avec 500+ cartes. Optimisation du rendu et des transitions.',         author:'Équipe ingénierie', published:true },
    { id:'cl3', version:'2.5.0',  date:'2026-04-08', tag:'Nouveau',    title:'Journal d\'interactions enrichi',                    body:'Débrief complet, prochaine étape, tags, pièces jointes. Le journal devient le centre névralgique de votre suivi.',       author:'Équipe produit', published:true },
    { id:'cl4', version:'2.4.7',  date:'2026-03-30', tag:'Correctif',  title:'Correction notifications email',                     body:'Résolution d\'un bug rare où les notifications de relance pouvaient être envoyées en double.',                           author:'Équipe ingénierie', published:true },
    { id:'cl5', version:'2.5.0-rc',date:'2026-04-26', tag:'À venir',    title:'Résumé IA des interactions (beta)',                  body:'Notre IA résume automatiquement les longues conversations LinkedIn et emails. Disponible en beta pour les comptes Business et Enterprise.', author:'Équipe produit', published:false },
  ],
}
