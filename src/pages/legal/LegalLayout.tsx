import { Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

// Shared chrome for the three RGPD pages (Mentions légales, CGU,
// Politique de confidentialité). Kept intentionally plain — these
// pages are read once and indexed, not styled to convert.
export default function LegalLayout({ title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f4f6ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="border-b border-[#e8eaf8] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Zap size={15} className="text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">Velmio CRM</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={12} /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        <p className="text-xs text-gray-500 mb-8">Dernière mise à jour : {lastUpdated}</p>

        <article className="prose-legal space-y-6 text-sm leading-relaxed text-gray-700">
          {children}
        </article>
      </main>

      <footer className="border-t border-[#e8eaf8] bg-white py-6 text-center text-xs text-gray-400">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/legal/mentions" className="hover:text-indigo-600">Mentions légales</Link>
          <span>·</span>
          <Link to="/legal/cgu" className="hover:text-indigo-600">CGU</Link>
          <span>·</span>
          <Link to="/legal/confidentialite" className="hover:text-indigo-600">Politique de confidentialité</Link>
        </div>
        <p className="mt-2">Velmio © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

// Tailwind doesn't ship typography styles by default; the few rules we
// need for legal pages live here so the layout stays readable without
// pulling @tailwindcss/typography.
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-gray-900 mt-6">{title}</h2>
      {children}
    </section>
  )
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
      {children}
    </span>
  )
}
