import { Link, Navigate } from 'react-router-dom'
import {
  Zap, Users, Bell, Upload, Mail, BarChart3,
  CheckCircle2, ArrowRight, Star, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Pipeline visuel',
    desc: "Visualisez vos prospects en Kanban ou tableau. Faites glisser les cartes d'une étape à l'autre en un clic.",
  },
  {
    icon: Bell,
    title: 'Relances intelligentes',
    desc: 'Planifiez vos prochains contacts et recevez des alertes pour ne jamais laisser un prospect sans suite.',
  },
  {
    icon: Mail,
    title: 'Email direct',
    desc: "Envoyez des emails personnalisés depuis la fiche prospect. L'historique est enregistré automatiquement.",
  },
  {
    icon: Upload,
    title: 'Import CSV / Excel',
    desc: 'Importez vos fichiers de prospects existants. La détection des colonnes est automatique.',
  },
  {
    icon: Users,
    title: 'Multi-agence',
    desc: 'Chaque client obtient son propre espace CRM avec ses couleurs, son logo et ses données.',
  },
  {
    icon: Zap,
    title: 'Personnalisable',
    desc: 'Activez ou désactivez les rubriques selon vos besoins : deal, services, réseaux sociaux, et plus.',
  },
]

const STEPS = [
  { num: '01', title: 'Créez votre espace', desc: 'Inscription en 30 secondes. Choisissez votre couleur et ajoutez votre logo.' },
  { num: '02', title: 'Ajoutez vos prospects', desc: 'Saisissez manuellement ou importez un fichier CSV/Excel avec vos contacts.' },
  { num: '03', title: 'Pilotez et convertissez', desc: 'Suivez chaque étape du cycle de vente et relancez au bon moment.' },
]

const FAQ = [
  {
    q: 'Est-ce que Sky Social CRM est gratuit ?',
    a: "Oui, le plan gratuit vous donne accès à 25 prospects et aux fonctionnalités essentielles. Le plan Pro à 9€/mois lève toutes les limites.",
  },
  {
    q: 'Puis-je importer mes prospects existants ?',
    a: "Oui, l'import CSV et Excel est disponible sur le plan Pro. La détection des colonnes est automatique.",
  },
  {
    q: 'Comment fonctionnent les emails directs ?',
    a: "Depuis la fiche d'un prospect, cliquez sur \"Email\" pour envoyer un message via des modèles prédéfinis (suivi, relance, RDV). L'envoi est enregistré dans l'historique.",
  },
  {
    q: "Puis-je personnaliser l'apparence ?",
    a: 'Oui, chaque espace a sa propre couleur principale et son logo. Vos clients voient votre identité visuelle.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-white hover:text-white/80 transition-colors"
      >
        {q}
        {open ? <ChevronUp size={16} className="flex-shrink-0 text-white/50" /> : <ChevronDown size={16} className="flex-shrink-0 text-white/50" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-white/60 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function LandingPage() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0f1a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(217_91%_60%)]">
              <Zap size={15} className="text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold tracking-tight">Sky Social CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[hsl(217_91%_60%)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-24 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[800px] rounded-full blur-[120px]" style={{ background: 'hsl(217 91% 60% / 0.08)' }} />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <Star size={11} className="text-yellow-400" fill="currentColor" />
            CRM conçu pour les agences de prospection
          </div>

          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Gérez votre prospection{' '}
            <span style={{ background: 'linear-gradient(to right, hsl(217 91% 60%), hsl(217 91% 75%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              comme un pro.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-white/60 leading-relaxed sm:text-lg">
            Pipeline visuel, relances automatiques, emails directs et import CSV.
            Tout ce dont vous avez besoin pour convertir vos prospects en clients.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg"
              style={{ background: 'hsl(217 91% 60%)', boxShadow: '0 10px 30px hsl(217 91% 60% / 0.25)' }}
            >
              Commencer gratuitement
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
            >
              Se connecter
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Gratuit jusqu'à 25 prospects</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Sans carte bancaire</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Prêt en 30 secondes</span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Tout ce qu'il vous faut pour prospecter</h2>
            <p className="mt-3 text-sm text-white/50">Un outil simple et puissant, pensé pour les agences et freelances.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'hsl(217 91% 60% / 0.15)' }}>
                  <Icon size={18} style={{ color: 'hsl(217 91% 70%)' }} />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Opérationnel en 3 étapes</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ background: 'hsl(217 91% 60% / 0.15)', borderColor: 'hsl(217 91% 60% / 0.2)' }}>
                  <span className="text-lg font-black" style={{ color: 'hsl(217 91% 65%)' }}>{num}</span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Tarifs simples et transparents</h2>
            <p className="mt-3 text-sm text-white/50">Commencez gratuitement, passez au Pro quand vous êtes prêt.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Gratuit</p>
              <p className="text-4xl font-black text-white mb-1">0€</p>
              <p className="text-sm text-white/40 mb-6">Pour débuter</p>
              <ul className="space-y-2.5 mb-6">
                {["Jusqu'à 25 prospects", 'Pipeline Kanban & tableau', 'Historique des interactions', 'Relances planifiées', 'Personnalisation visuelle'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full rounded-xl border border-white/15 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/5 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ border: '1px solid hsl(217 91% 60% / 0.4)', background: 'hsl(217 91% 60% / 0.08)' }}>
              <div className="absolute top-4 right-4">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide" style={{ background: 'hsl(217 91% 60%)' }}>
                  Recommandé
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(217 91% 70%)' }}>Pro</p>
              <p className="text-4xl font-black text-white mb-1">
                9€
                <span className="text-base font-normal text-white/40"> / mois</span>
              </p>
              <p className="text-sm text-white/40 mb-6">Sans engagement</p>
              <ul className="space-y-2.5 mb-6">
                {['Prospects illimités', 'Import CSV / Excel', 'Email direct aux prospects', 'Toutes les fonctionnalités Free', 'Export Excel/CSV', 'Support prioritaire'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 size={13} className="flex-shrink-0" style={{ color: 'hsl(217 91% 65%)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg"
                style={{ background: 'hsl(217 91% 60%)', boxShadow: '0 10px 30px hsl(217 91% 60% / 0.2)' }}
              >
                <Zap size={14} />
                Commencer avec le Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Questions fréquentes</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6">
            {FAQ.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 py-24 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[600px] rounded-full blur-[100px]" style={{ background: 'hsl(217 91% 60% / 0.06)' }} />
        </div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
            Prêt à organiser votre prospection ?
          </h2>
          <p className="mb-8 text-sm text-white/50">
            Créez votre espace en 30 secondes. Aucune carte bancaire requise.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg"
            style={{ background: 'hsl(217 91% 60%)', boxShadow: '0 10px 30px hsl(217 91% 60% / 0.25)' }}
          >
            Créer votre espace gratuit
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-white/30">
        Sky Social Agency © {new Date().getFullYear()} · CRM de prospection
      </footer>
    </div>
  )
}
