import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { useUpdateProfile } from '@/hooks/useUserProfile'
import { useSubscription, createCheckoutSession, FREE_PLAN } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import ColorPicker from '@/components/common/ColorPicker'
import LogoUpload from '@/components/common/LogoUpload'
import type { SectionPrefs } from '@/types'

const NAV = [
  { id: 'compte', label: 'Mon compte', emoji: '👤' },
  { id: 'securite', label: 'Sécurité', emoji: '🔒' },
  { id: 'notifications', label: 'Notifications', emoji: '🔔' },
  { id: 'apparence', label: 'Apparence', emoji: '🎨' },
  { id: 'integrations', label: 'Intégrations', emoji: '🔗' },
  { id: 'abonnement', label: 'Abonnement', emoji: '💳' },
  { id: 'equipe', label: 'Équipe', emoji: '👥' },
  { id: 'donnees', label: 'Données', emoji: '📦' },
  { id: 'api', label: 'API & Webhooks', emoji: '⚡' },
]

const SECTION_LABELS: { key: keyof SectionPrefs; label: string; description: string }[] = [
  { key: 'show_followup', label: 'Planificateur de relance', description: 'Date du prochain contact' },
  { key: 'show_interactions', label: 'Historique des interactions', description: 'Journal des appels, emails, RDV…' },
  { key: 'show_services', label: 'Services intéressés', description: 'Tags des services sur la fiche' },
  { key: 'show_deal', label: 'Valeur du deal', description: 'Montant estimé du contrat' },
  { key: 'show_social', label: 'Liens sociaux', description: 'LinkedIn, Instagram, Google Maps' },
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-primary' : 'bg-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-border p-10 text-center">
      <p className="text-3xl mb-3">🚧</p>
      <p className="text-sm font-bold text-text mb-1">{label}</p>
      <span className="inline-flex items-center gap-1 rounded-pill bg-primary-light border border-primary-border px-3 py-1 text-[11px] font-semibold text-primary">
        Bientôt disponible
      </span>
    </div>
  )
}

export default function SettingsPage() {
  const { profile, applyTheme, refreshProfile, sectionPrefs, updateSectionPrefs } = useTheme()
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const { data: subscription = FREE_PLAN } = useSubscription()

  const [activeSection, setActiveSection] = useState('compte')

  // Mon compte
  const [companyName, setCompanyName] = useState('')
  const [companySuccess, setCompanySuccess] = useState(false)
  const [companyError, setCompanyError] = useState('')

  // Apparence
  const [color, setColor] = useState('217 91% 60%')
  const [originalColor, setOriginalColor] = useState('217 91% 60%')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [clearLogo, setClearLogo] = useState(false)
  const [appearSuccess, setAppearSuccess] = useState(false)
  const [appearError, setAppearError] = useState('')

  // Sections
  const [sectionSaving, setSectionSaving] = useState(false)
  const [sectionSuccess, setSectionSuccess] = useState(false)

  // Abonnement
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name)
      setColor(profile.primary_color)
      setOriginalColor(profile.primary_color)
    }
  }, [profile])

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompanyError('')
    if (!companyName.trim()) { setCompanyError('Le nom de société est obligatoire.'); return }
    try {
      await updateProfile.mutateAsync({
        company_name: companyName.trim(),
        primary_color: color,
        logo_url: clearLogo ? null : (profile?.logo_url ?? null),
      })
      await refreshProfile()
      setCompanySuccess(true)
      setTimeout(() => setCompanySuccess(false), 3000)
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault()
    setAppearError('')
    try {
      let logoUrl = clearLogo ? null : (profile?.logo_url ?? null)
      if (logoFile && user) {
        const ext = logoFile.name.split('.').pop()
        const path = `${user.id}/logo.${ext}`
        const { error } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true })
        if (error) throw error
        logoUrl = supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
      }
      await updateProfile.mutateAsync({
        company_name: profile?.company_name ?? companyName,
        primary_color: color,
        logo_url: logoUrl,
      })
      await refreshProfile()
      setOriginalColor(color)
      setLogoFile(null)
      setClearLogo(false)
      setAppearSuccess(true)
      setTimeout(() => setAppearSuccess(false), 3000)
    } catch (err) {
      setAppearError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  const handleSectionToggle = async (key: keyof SectionPrefs) => {
    const next: SectionPrefs = { ...sectionPrefs, [key]: !sectionPrefs[key] }
    setSectionSaving(true)
    try {
      await updateSectionPrefs(next)
      setSectionSuccess(true)
      setTimeout(() => setSectionSuccess(false), 2000)
    } finally {
      setSectionSaving(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgradeError('')
    setUpgrading(true)
    try {
      const url = await createCheckoutSession(window.location.href)
      window.location.href = url
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setUpgrading(false)
    }
  }

  const CONTENT: Record<string, React.ReactNode> = {
    compte: (
      <form onSubmit={handleSaveCompany} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Mon compte</h2>
          <p className="text-[13px] text-muted mt-0.5">Informations de votre espace.</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Société</p>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text">Nom de la société</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        {companyError && (
          <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">
            {companyError}
          </p>
        )}
        {companySuccess && (
          <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
            Paramètres sauvegardés.
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-primary"
          >
            {updateProfile.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    ),

    apparence: (
      <form onSubmit={handleSaveAppearance} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Apparence</h2>
          <p className="text-[13px] text-muted mt-0.5">Personnalisez le look de votre CRM.</p>
        </div>

        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Couleur principale</p>
          <ColorPicker value={color} onChange={(hsl) => { setColor(hsl); applyTheme(hsl) }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => { setColor(originalColor); applyTheme(originalColor) }}
              className="rounded-btn border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors">
              Annuler
            </button>
          </div>
        </div>

        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Logo</p>
          <LogoUpload
            currentUrl={clearLogo ? null : (profile?.logo_url ?? null)}
            onFile={setLogoFile}
            onClear={() => { setLogoFile(null); setClearLogo(true) }}
          />
        </div>

        <div className="rounded-card border border-border bg-card divide-y divide-border">
          <div className="px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Rubriques de la fiche prospect</p>
          </div>
          {SECTION_LABELS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-text">{label}</p>
                <p className="text-[11px] text-muted">{description}</p>
              </div>
              <Toggle
                checked={sectionPrefs[key]}
                onChange={() => handleSectionToggle(key)}
                disabled={sectionSaving}
              />
            </div>
          ))}
          {sectionSuccess && (
            <div className="px-5 py-2">
              <p className="text-xs text-crm-green">Préférences sauvegardées.</p>
            </div>
          )}
        </div>

        {appearError && (
          <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">
            {appearError}
          </p>
        )}
        {appearSuccess && (
          <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
            Apparence sauvegardée.
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-primary"
          >
            {updateProfile.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    ),

    abonnement: (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Abonnement</h2>
          <p className="text-[13px] text-muted mt-0.5">Gérez votre plan Sky Social CRM.</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text">
                {subscription.status === 'active' ? (
                  <span className="text-crm-green flex items-center gap-1.5"><Zap size={13} /> Plan Pro</span>
                ) : subscription.status === 'past_due' ? (
                  <span className="text-crm-amber">Paiement en attente</span>
                ) : subscription.status === 'cancelled' ? (
                  <span className="text-muted">Plan annulé</span>
                ) : (
                  <span className="text-muted">Plan gratuit</span>
                )}
              </p>
              {subscription.status === 'active' && subscription.current_period_end && (
                <p className="text-[11px] text-muted mt-0.5">
                  Actif jusqu'au {format(new Date(subscription.current_period_end), 'd MMM yyyy', { locale: fr })}
                </p>
              )}
              {subscription.status !== 'active' && (
                <p className="text-[11px] text-muted mt-0.5">
                  Limite : {subscription.prospect_limit} prospects
                </p>
              )}
            </div>
            {subscription.status !== 'active' && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-primary"
              >
                <Zap size={13} />
                {upgrading ? 'Redirection…' : 'Passer au Pro — 9€/mois'}
              </button>
            )}
          </div>
          {upgradeError && <p className="text-xs text-crm-red">{upgradeError}</p>}
        </div>
      </div>
    ),

    securite: <ComingSoon label="Sécurité" />,
    notifications: <ComingSoon label="Notifications" />,
    integrations: <ComingSoon label="Intégrations" />,
    equipe: <ComingSoon label="Équipe" />,
    donnees: <ComingSoon label="Données" />,
    api: <ComingSoon label="API & Webhooks" />,
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl">
      {/* Sidebar — horizontal scroll tabs on mobile, vertical list on desktop */}
      <aside className="md:w-52 md:flex-shrink-0">
        {/* Mobile: horizontal scrollable pill tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'flex items-center gap-1.5 flex-shrink-0 rounded-btn px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap',
                activeSection === item.id
                  ? 'bg-primary text-white'
                  : 'border border-border bg-card text-muted hover:text-text'
              )}
            >
              <span className="text-sm">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
        {/* Desktop: vertical list */}
        <div className="hidden md:block rounded-card border border-border bg-card overflow-hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'flex items-center gap-2.5 w-full px-4 py-3 text-left text-xs font-semibold transition-colors border-l-2',
                activeSection === item.id
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-transparent text-muted hover:text-text hover:bg-bg'
              )}
            >
              <span className="text-sm">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {CONTENT[activeSection]}
      </div>
    </div>
  )
}
