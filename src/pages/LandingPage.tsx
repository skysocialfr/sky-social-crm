import { Link, Navigate } from 'react-router-dom'
import {
  Zap, Bell, Upload, Mail, BarChart3,
  CheckCircle2, ArrowRight, Star, ChevronDown, ChevronUp, Users,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const FEATURES = [
  { emoji: '📊', bg: 'bg-blue-50', title: 'Pipeline visuel', desc: "Visualisez vos prospects en Kanban ou tableau. Glissez les cartes d'une étape à l'autre en un clic." },
  { emoji: '🔔', bg: 'bg-amber-50', title: 'Relances intelligentes', desc: "Planifiez vos prochains contacts et recevez des alertes pour ne jamais laisser un prospect sans suite." },
  { emoji: '✉️', bg: 'bg-violet-50', title: 'Email direct', desc: "Envoyez des emails personnalisés depuis la fiche prospect. L'historique est enregistré automatiquement." },
  { emoji: '📁', bg: 'bg-emerald-50', title: 'Import CSV / Excel', desc: "Importez vos fichiers de prospects existants. La détection des colonnes est automatique." },
  { emoji: '🏢', bg: 'bg-pink-50', title: 'Multi-agence', desc: "Chaque client obtient son propre espace CRM avec ses couleurs, son logo et ses données." },
  { emoji: '⚡', bg: 'bg-indigo-50', title: 'Personnalisable', desc: "Activez ou désactivez les rubriques selon vos besoins : deal, services, réseaux sociaux, et plus." },
]

const TESTIMONIALS = [
  { name: 'Sophie M.', role: 'Fondatrice, Agence Boost', text: "Sky Social CRM a transformé notre processus de vente. On ne perd plus aucun prospect.", stars: 5 },
  { name: 'Thomas L.', role: 'Directeur commercial, WebAgency', text: "L'interface est tellement claire. Toute l'équipe l'a adopté en moins d'une journée.", stars: 5 },
  { name: 'Camille R.', role: 'Freelance, consultant marketing', text: "Le plan gratuit suffit pour mes besoins. Simple, rapide, efficace. Je recommande !", stars: 5 },
]

const FAQ = [
  { q: 'Est-ce que Sky Social CRM est gratuit ?', a: "Oui, le plan gratuit vous donne accès à 25 prospects et aux fonctionnalités essentielles. Le plan Pro à 9€/mois lève toutes les limites." },
  { q: 'Puis-je importer mes prospects existants ?', a: "Oui, l'import CSV et Excel est disponible sur le plan Pro. La détection des colonnes est automatique." },
  { q: 'Comment fonctionnent les emails directs ?', a: 'Depuis la fiche d\'un prospect, cliquez sur "Email" pour envoyer un message via des modèles prédéfinis (suivi, relance, RDV). L\'envoi est enregistré dans l\'historique.' },
  { q: "Puis-je personnaliser l'apparence ?", a: "Oui, chaque espace a sa propre couleur principale et son logo. Vos clients voient votre identité visuelle." },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e8eaf8] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors"
      >
        {q}
        {open ? <ChevronUp size={16} className="flex-shrink-0 text-gray-400" /> : <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />}
      </button>
      {open && <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function LandingPage() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen bg-[#f4f6ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#e8eaf8] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap size={15} className="text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Sky Social CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Se connecter
            </Link>
            <Link
              to="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pt-20 pb-10 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-600">
            <Star size={11} className="text-yellow-400" fill="currentColor" />
            CRM conçu pour les agences de prospection
          </div>

          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Gérez votre prospection{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              comme un pro.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-gray-500 leading-relaxed sm:text-lg">
            Pipeline visuel, relances automatiques, emails directs et import CSV.
            Tout ce dont vous avez besoin pour convertir vos prospects en clients.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}
            >
              Commencer gratuitement
              <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="rounded-xl border border-[#e8eaf8] bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:border-indigo-200 transition-colors shadow-sm">
              Se connecter
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Gratuit jusqu'à 25 prospects</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Sans carte bancaire</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Prêt en 30 secondes</span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="rounded-2xl border border-[#e8eaf8] bg-white overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(99,102,241,0.12)' }}>
            <div className="flex items-center gap-2 border-b border-[#f0f1f8] bg-[#f8f9ff] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="mx-auto flex items-center rounded-md border border-[#e8eaf8] bg-white px-3 py-1 text-xs text-gray-400">
                app.skysocial.fr
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Prospects', value: '142', color: 'bg-blue-50' },
                  { label: 'Chauds', value: '23', color: 'bg-red-50' },
                  { label: 'Relances', value: '8', color: 'bg-amber-50' },
                  { label: 'Conv.', value: '18%', color: 'bg-emerald-50' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl ${color} p-3`}>
                    <p className="text-[10px] text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-black text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#f0f1f8] p-3">
                <p className="text-xs font-semibold text-gray-600 mb-3">Pipeline par étape</p>
                <div className="space-y-2">
                  {[
                    { label: 'Identifié', w: '80%', color: 'bg-slate-300' },
                    { label: 'Premier contact', w: '60%', color: 'bg-blue-400' },
                    { label: 'RDV fixé', w: '40%', color: 'bg-violet-400' },
                    { label: 'Gagné', w: '20%', color: 'bg-emerald-400' },
                  ].map(({ label, w, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 w-24 text-right">{label}</span>
                      <div className="flex-1 h-2 bg-[#f0f1f8] rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tout ce qu'il vous faut pour prospecter</h2>
            <p className="mt-3 text-sm text-gray-500">Un outil simple et puissant, pensé pour les agences et freelances.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ emoji, bg, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#e8eaf8] bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-xl`}>
                  {emoji}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-5 py-20" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ce qu'en disent nos clients</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-300" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-white/90 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-white/60">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-20 bg-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tarifs simples et transparents</h2>
            <p className="mt-3 text-sm text-gray-500">Commencez gratuitement, passez au Pro quand vous êtes prêt.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 items-start">
            {/* Free */}
            <div className="rounded-2xl border border-[#e8eaf8] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Gratuit</p>
              <p className="text-4xl font-black text-gray-900 mb-1">0€</p>
              <p className="text-sm text-gray-400 mb-6">Pour débuter</p>
              <ul className="space-y-2.5 mb-6">
                {["Jusqu'à 25 prospects", 'Pipeline Kanban & tableau', 'Historique des interactions', 'Relances planifiées', 'Personnalisation visuelle'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full rounded-xl border border-[#e8eaf8] py-2.5 text-center text-sm font-semibold text-gray-700 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 relative overflow-visible -mt-4" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-bold text-yellow-900 uppercase tracking-wide shadow-md">
                  ⭐ Recommandé
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-3 mt-3">Pro</p>
              <p className="text-4xl font-black text-white mb-1">
                9€<span className="text-base font-normal text-indigo-200"> / mois</span>
              </p>
              <p className="text-sm text-indigo-200 mb-6">Sans engagement</p>
              <ul className="space-y-2.5 mb-6">
                {['Prospects illimités', 'Import CSV / Excel', 'Email direct aux prospects', 'Toutes les fonctionnalités Free', 'Export Excel/CSV', 'Support prioritaire'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle2 size={13} className="text-indigo-200 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="flex items-center justify-center gap-2 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg">
                <Zap size={14} />
                Commencer avec le Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20 bg-[#f4f6ff]">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Questions fréquentes</h2>
          </div>
          <div className="rounded-2xl border border-[#e8eaf8] bg-white px-6">
            {FAQ.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24 text-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
            Prêt à organiser votre prospection ?
          </h2>
          <p className="mb-8 text-sm text-indigo-200">
            Créez votre espace en 30 secondes. Aucune carte bancaire requise.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-xl"
          >
            Créer votre espace gratuit
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8eaf8] bg-white px-5 py-6 text-center text-xs text-gray-400">
        Sky Social Agency © {new Date().getFullYear()} · CRM de prospection
      </footer>
    </div>
  )
}
