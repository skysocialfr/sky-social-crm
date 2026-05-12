import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'

// Velmio CRM only uses functional storage (Supabase Auth session,
// theme preference, this consent flag). No tracking, no analytics, no
// ads — so per CNIL guidance we don't actually need a consent banner,
// just an information notice. This component shows that notice once
// and remembers the dismissal in localStorage.
//
// If/when an analytics tool is added later, this should be upgraded
// into a real consent manager (accept / refuse / customize).

const STORAGE_KEY = 'velmio-cookie-notice-ack'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true)
      }
    } catch {
      // Private mode / storage disabled — show the banner just in case,
      // it won't persist anyway.
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] md:inset-auto md:bottom-4 md:left-4 md:right-auto md:max-w-md">
      <div className="rounded-2xl border border-[#e8eaf8] bg-white p-4 shadow-xl"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            <Cookie size={16} className="text-white" />
          </div>
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">Cookies & confidentialité</p>
            <p className="text-xs leading-relaxed text-gray-600">
              Velmio CRM utilise uniquement des cookies strictement nécessaires au fonctionnement
              (session de connexion, préférence d'affichage). Aucun cookie de tracking ou
              publicitaire n'est utilisé.{' '}
              <a href="/legal/confidentialite" className="text-indigo-600 hover:underline">
                En savoir plus
              </a>.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  )
}
