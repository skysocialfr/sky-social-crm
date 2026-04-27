
// Portrait helper: stable stylized avatars from DiceBear (no personally-identifiable photos)
const AV = (seed, style='notionists-neutral') =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,b6e3f4,d1d4f9,ffd5dc,ffdfbf,c0e5c8&radius=50`

window.AV = AV

window.CRM = {
  user: { name: 'Marie Dupont', initials: 'MD', email: 'marie@skysocial.fr', company: 'Sky Social Agency', avatar: AV('Marie Dupont') },

  team: [
    { id:'u1', name:'Marie Dupont',    role:'Account Manager', avatar: AV('Marie Dupont'),    deals:12, revenue:48500, winRate:28, online:true  },
    { id:'u2', name:'Thomas Bernard',  role:'SDR',             avatar: AV('Thomas Bernard'),  deals:18, revenue:32000, winRate:22, online:true  },
    { id:'u3', name:'Léa Moreau',      role:'Closer',          avatar: AV('Lea Moreau'),      deals:8,  revenue:61200, winRate:44, online:false },
    { id:'u4', name:'Kevin Assouline', role:'SDR',             avatar: AV('Kevin Assouline'), deals:14, revenue:25800, winRate:18, online:true  },
  ],

  stats: {
    totalProspects: 47, totalTrend: +12,
    potentialRevenue: 284500, revenueTrend: +8.3,
    conversionRate: 23, conversionTrend: +2.1,
    hotProspects: 8, hotTrend: -1,
    followupToday: 5, followupOverdue: 2,
    monthlyGoal: 50000, monthlyRevenue: 31200,
    wonThisMonth: 3,
    sparkRevenue: [18000,21000,19500,24000,26000,28500,31200],
    sparkConversion: [18,19,20,21,20,22,23],
    sparkProspects: [32,35,37,38,40,44,47],
    sparkHot: [6,7,9,8,10,9,8],
  },

  prospects: [
    { id:'1', company:'TechStart SAS', contact:'Jean Martin', avatar:AV('Jean Martin'), title:'CEO', sector:'Tech', stage:'En négociation', priority:'Chaud', channel:'LinkedIn', value:12000, currency:'€', followup:'2026-04-23', score:87, initials:'TS', color:'#6366f1', city:'Paris', email:'jean@techstart.fr', phone:'+33 6 12 34 56 78' },
    { id:'2', company:'Beauté Concept', contact:'Sophie Leroi', avatar:AV('Sophie Leroi'), title:'Directrice Mktg', sector:'Beauté', stage:'RDV fixé', priority:'Chaud', channel:'Instagram/DMs', value:4500, currency:'€', followup:'2026-04-22', score:74, initials:'BC', color:'#ec4899', city:'Lyon', email:'sophie@beauteconcept.fr', phone:null },
    { id:'3', company:'Immo Plus', contact:'Pierre Dubois', avatar:AV('Pierre Dubois'), title:'Gérant', sector:'Immobilier', stage:'Devis envoyé', priority:'Tiède', channel:'Email froid', value:8000, currency:'€', followup:'2026-04-25', score:61, initials:'IP', color:'#10b981', city:'Bordeaux', email:'p.dubois@immoplus.fr', phone:'+33 6 98 76 54 32' },
    { id:'4', company:'RestauGroup', contact:'Camille Laurent', avatar:AV('Camille Laurent'), title:'Co-fondatrice', sector:'Restauration', stage:'Premier contact', priority:'Froid', channel:'Téléphone/Physique', value:3200, currency:'€', followup:null, score:32, initials:'RG', color:'#f59e0b', city:'Marseille', email:null, phone:'+33 4 91 22 33 44' },
    { id:'5', company:'ModaLux', contact:'Antoine Petit', avatar:AV('Antoine Petit'), title:'CMO', sector:'Mode', stage:'Réponse reçue', priority:'Chaud', channel:'Instagram/DMs', value:6500, currency:'€', followup:'2026-04-21', score:79, initials:'ML', color:'#8b5cf6', city:'Paris', email:'antoine@modalux.com', phone:null },
    { id:'6', company:'Startup Labs', contact:'Léa Bernard', avatar:AV('Léa Bernard'), title:'Founder', sector:'Tech', stage:'Identifié', priority:'Tiède', channel:'LinkedIn', value:9000, currency:'€', followup:null, score:45, initials:'SL', color:'#06b6d4', city:'Nantes', email:'lea@startuplabs.io', phone:null },
    { id:'7', company:'AutoMoto FR', contact:'Marc Rousseau', avatar:AV('Marc Rousseau'), title:'Responsable web', sector:'Automobile', stage:'Gagné', priority:'Chaud', channel:'LinkedIn', value:15000, currency:'€', followup:null, score:95, initials:'AM', color:'#22c55e', city:'Paris', email:'marc@automoto.fr', phone:'+33 1 42 00 11 22' },
    { id:'8', company:'Cabinet Santé', contact:'Dr. Nathalie Morin', avatar:AV('Dr. Nathalie Morin'), title:'Médecin chef', sector:'Santé', stage:'Perdu', priority:'Froid', channel:'Email froid', value:2000, currency:'€', followup:null, score:10, initials:'CS', color:'#6b7280', city:'Toulouse', email:'n.morin@cabinet-sante.fr', phone:null },
    { id:'9', company:'EduConnect', contact:'Thomas Garcia', avatar:AV('Thomas Garcia'), title:'Product Manager', sector:'EdTech', stage:'Premier contact', priority:'Tiède', channel:'LinkedIn', value:5500, currency:'€', followup:'2026-04-24', score:53, initials:'EC', color:'#f97316', city:'Lille', email:'tgarcia@educonnect.io', phone:null },
    { id:'10', company:'ArtisanBio', contact:'Emma Fontaine', avatar:AV('Emma Fontaine'), title:'Fondatrice', sector:'Alimentation', stage:'RDV fixé', priority:'Chaud', channel:'Instagram/DMs', value:3800, currency:'€', followup:'2026-04-23', score:71, initials:'AB', color:'#22c55e', city:'Rennes', email:'emma@artisanbio.fr', phone:'+33 6 55 44 33 22' },
    { id:'11', company:'FinTech Solutions', contact:'David Hamid', avatar:AV('David Hamid'), title:'CTO', sector:'Finance', stage:'En négociation', priority:'Chaud', channel:'LinkedIn', value:22000, currency:'€', followup:'2026-04-26', score:82, initials:'FS', color:'#3b82f6', city:'Paris', email:'d.hamid@fintech-solutions.fr', phone:null },
    { id:'12', company:'Agence Pixel', contact:'Julie Chen', avatar:AV('Julie Chen'), title:'Creative Director', sector:'Agence', stage:'Devis envoyé', priority:'Tiède', channel:'Email froid', value:5000, currency:'€', followup:'2026-04-27', score:58, initials:'AP', color:'#a78bfa', city:'Strasbourg', email:'julie@agencepixel.fr', phone:null },
  ],

  interactions: [
    { id:'i1', prospectId:'1', prospect:'TechStart SAS', type:'Appel', summary:'Appel de qualification — très intéressé par le pack SEO + Social', outcome:'Positif', time:'14:32', date:"Aujourd'hui", icon:'📞' },
    { id:'i2', prospectId:'2', prospect:'Beauté Concept', type:'LinkedIn', summary:'Réponse positive, RDV confirmé pour jeudi 24 avril', outcome:'Positif', time:'11:15', date:"Aujourd'hui", icon:'💼' },
    { id:'i3', prospectId:'5', prospect:'ModaLux', type:'Email', summary:'Envoi de la proposition commerciale personnalisée', outcome:'En attente', time:'09:44', date:"Aujourd'hui", icon:'📧' },
    { id:'i4', prospectId:'7', prospect:'AutoMoto FR', type:'Réunion', summary:'Signature du contrat — Deal gagné ! 🎉', outcome:'Gagné', time:'16:00', date:'Hier', icon:'🤝' },
    { id:'i5', prospectId:'3', prospect:'Immo Plus', type:'Email', summary:'Relance suite au devis envoyé la semaine dernière', outcome:'En attente', time:'10:20', date:'Hier', icon:'📧' },
  ],

  journal: [
    { id:'j1',  prospectId:'1',  prospect:'TechStart SAS',    initials:'TS', color:'#6366f1', type:'Appel',         stage:'En négociation',  outcome:'Positif',   date:'22 avr. 2026', time:'14:32', icon:'📞', summary:'Appel de qualification approfondi. Jean très réceptif au pack SEO + Social Media. Il a évoqué un budget de 12 000 € / an. Décision attendue d\'ici vendredi.', next:'Envoyer la proposition définitive avant jeudi 24/04.' },
    { id:'j2',  prospectId:'2',  prospect:'Beauté Concept',   initials:'BC', color:'#ec4899', type:'LinkedIn',       stage:'RDV fixé',        outcome:'Positif',   date:'22 avr. 2026', time:'11:15', icon:'💼', summary:'Sophie a répondu positivement à notre message LinkedIn sur la stratégie Instagram. Elle veut voir des exemples de campagnes beauté que l\'on a menées.', next:'Préparer un deck de cas clients beauté pour le RDV du 24.' },
    { id:'j3',  prospectId:'5',  prospect:'ModaLux',          initials:'ML', color:'#8b5cf6', type:'Email',          stage:'Réponse reçue',   outcome:'En attente',date:'22 avr. 2026', time:'09:44', icon:'📧', summary:'Envoi de la proposition commerciale personnalisée : pack Social Media + Influence 6 500 €/mois. Pas encore de retour. A relancer dans 48h si pas de réponse.', next:'Relance téléphonique le 24/04 si pas de réponse email.' },
    { id:'j4',  prospectId:'7',  prospect:'AutoMoto FR',      initials:'AM', color:'#22c55e', type:'Réunion',        stage:'Gagné',           outcome:'Gagné',     date:'21 avr. 2026', time:'16:00', icon:'🤝', summary:'Réunion de signature avec Marc Rousseau et son DG. Contrat signé pour 15 000 €/an. Démarrage prévu le 1er mai. Briefing équipe prévu la semaine prochaine.', next:'Envoyer le contrat signé + onboarding client.' },
    { id:'j5',  prospectId:'3',  prospect:'Immo Plus',        initials:'IP', color:'#10b981', type:'Email',          stage:'Devis envoyé',    outcome:'En attente',date:'21 avr. 2026', time:'10:20', icon:'📧', summary:'Deuxième relance suite au devis de 8 000 € envoyé le 14/04. Pierre Dubois n\'a pas encore répondu. Son assistant a confirmé qu\'il était en déplacement jusqu\'au 22.', next:'Appel direct le 23/04.' },
    { id:'j6',  prospectId:'11', prospect:'FinTech Solutions', initials:'FS', color:'#3b82f6', type:'LinkedIn',      stage:'En négociation',  outcome:'Positif',   date:'20 avr. 2026', time:'16:45', icon:'💼', summary:'David Hamid a accepté notre connexion LinkedIn et commenté positivement notre article sur l\'acquisition B2B. Premier échange très prometteur sur leurs besoins en lead gen.', next:'Proposer un appel de 30 min cette semaine.' },
    { id:'j7',  prospectId:'10', prospect:'ArtisanBio',       initials:'AB', color:'#22c55e', type:'Instagram',      stage:'RDV fixé',        outcome:'Positif',   date:'20 avr. 2026', time:'12:10', icon:'📸', summary:'Emma nous a contactés en DM Instagram suite à notre post sur le marketing local. Elle cherche à développer sa présence en ligne pour sa boutique bio.', next:'RDV Zoom le 23/04 à 10h.' },
    { id:'j8',  prospectId:'9',  prospect:'EduConnect',       initials:'EC', color:'#f97316', type:'Appel',          stage:'Premier contact', outcome:'Tiède',     date:'19 avr. 2026', time:'15:30', icon:'📞', summary:'Premier appel avec Thomas Garcia. Il est intéressé mais le budget n\'est pas encore validé par sa direction. Il doit revenir vers nous sous 2 semaines.', next:'Relance le 24/04. Envoyer un document de présentation.' },
    { id:'j9',  prospectId:'6',  prospect:'Startup Labs',     initials:'SL', color:'#06b6d4', type:'Note interne',   stage:'Identifié',       outcome:null,        date:'18 avr. 2026', time:'09:00', icon:'📝', summary:'Prospect identifié via le post LinkedIn de Léa Bernard sur leur levée de fonds série A de 2M€. Profil très intéressant : scale-up tech, budget marketing en croissance.', next:'Envoyer un premier message LinkedIn personnalisé.' },
    { id:'j10', prospectId:'12', prospect:'Agence Pixel',     initials:'AP', color:'#a78bfa', type:'Email',          stage:'Devis envoyé',    outcome:'En attente',date:'17 avr. 2026', time:'11:00', icon:'📧', summary:'Envoi d\'un devis pour la refonte de leur stratégie social media : 5 000 €/trimestre. Julie Chen semble convaincue mais attend la validation de son DAF.', next:'Suivi RDV le 27/04.' },
    { id:'j11', prospectId:'4',  prospect:'RestauGroup',      initials:'RG', color:'#f59e0b', type:'Téléphone',      stage:'Premier contact', outcome:'Froid',     date:'16 avr. 2026', time:'14:00', icon:'☎', summary:'Appel difficile avec Camille Laurent. Peu disponible, sceptique sur la valeur des réseaux sociaux pour un groupe de restauration. À retravailler avec des cas clients F&B.', next:'Envoyer une étude de cas restaurant avant de rappeler.' },
    { id:'j12', prospectId:'1',  prospect:'TechStart SAS',    initials:'TS', color:'#6366f1', type:'LinkedIn',       stage:'Réponse reçue',   outcome:'Positif',   date:'18 avr. 2026', time:'09:30', icon:'💼', summary:'Message LinkedIn de premier contact sur leur problématique de visibilité B2B. Jean Martin a répondu en 2h — très bon signal d\'engagement.', next:'Planifier un appel de qualification.' },
  ],

  detailInteractions: {
    '1': [
      { id:'d1', type:'Appel', summary:'Appel de qualification — très intéressé par le pack SEO + Social', outcome:'Positif', next:'Envoyer la proposition', date:'22 avr. 2026', icon:'📞' },
      { id:'d2', type:'LinkedIn', summary:'Premier message LinkedIn — réponse rapide et enthousiaste', outcome:'Positif', next:'Planifier un appel', date:'18 avr. 2026', icon:'💼' },
      { id:'d3', type:'Note interne', summary:'Prospect identifié via post LinkedIn sur leur levée de fonds', outcome:null, next:null, date:'15 avr. 2026', icon:'📝' },
    ]
  },

  byStage: [
    { stage:'Identifié', count:8, value:42000, max:10 },
    { stage:'Premier contact', count:10, value:58000, max:10 },
    { stage:'Réponse reçue', count:7, value:47500, max:10 },
    { stage:'RDV fixé', count:6, value:52000, max:10 },
    { stage:'Devis envoyé', count:5, value:44000, max:10 },
    { stage:'En négociation', count:4, value:38000, max:10 },
    { stage:'Gagné', count:5, value:85000, max:10 },
    { stage:'Perdu', count:2, value:7000, max:10 },
  ],

  byChannel: [
    { channel:'LinkedIn', count:18, color:'#6366f1' },
    { channel:'Instagram/DMs', count:12, color:'#ec4899' },
    { channel:'Email froid', count:10, color:'#06b6d4' },
    { channel:'Téléphone', count:7, color:'#f59e0b' },
  ],

  relances: [
    { id:'5', company:'ModaLux', contact:'Antoine Petit', avatar:AV('Antoine Petit'), priority:'Chaud', stage:'Réponse reçue', date:'2026-04-21', overdue:true },
    { id:'1', company:'TechStart SAS', contact:'Jean Martin', avatar:AV('Jean Martin'), priority:'Chaud', stage:'En négociation', date:'2026-04-22', overdue:false },
    { id:'2', company:'Beauté Concept', contact:'Sophie Leroi', avatar:AV('Sophie Leroi'), priority:'Chaud', stage:'RDV fixé', date:'2026-04-22', overdue:false },
    { id:'9', company:'EduConnect', contact:'Thomas Garcia', avatar:AV('Thomas Garcia'), priority:'Tiède', stage:'Premier contact', date:'2026-04-24', overdue:false },
    { id:'3', company:'Immo Plus', contact:'Pierre Dubois', avatar:AV('Pierre Dubois'), priority:'Tiède', stage:'Devis envoyé', date:'2026-04-25', overdue:false },
  ],

  analytics: {
    revenueMonths: ['Oct','Nov','Déc','Jan','Fév','Mar','Avr'],
    revenueWon: [18000,22000,19000,28000,25000,32000,31200],
    revenuePipeline: [45000,52000,48000,61000,58000,72000,68000],
    conversionMonths: ['Oct','Nov','Déc','Jan','Fév','Mar','Avr'],
    conversionRates: [18,19,20,18,21,22,23],
    avgDealCycle: 18, // days
    avgDealValue: 7200,
    topChannelWin: 'LinkedIn',
    stageConversion: [
      { from:'Identifié', to:'Premier contact', rate:78 },
      { from:'Premier contact', to:'Réponse reçue', rate:62 },
      { from:'Réponse reçue', to:'RDV fixé', rate:71 },
      { from:'RDV fixé', to:'Devis envoyé', rate:85 },
      { from:'Devis envoyé', to:'En négociation', rate:74 },
      { from:'En négociation', to:'Gagné', rate:55 },
    ]
  }
}
