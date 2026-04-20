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

const SECTION_LABELS: { key: keyof SectionPrefs; label: string; description: string }[] = [
  { key: 'show_followup', label: 'Planificateur de relance', description: 'Date du prochain contact' },
  { key: 'show_interactions', label: 'Historique des interactions', description: 'Journal des appels, emails, RDV…' },
  { key: 'show_services', label: 'Services intéressés', description: 'Tags des services sur la fiche' },
  { key: 'show_deal', label: 'Valeur du deal', description: 'Montant estimé du contrat' },
  { key: 'show_social', label: 'Liens sociaux', description: 'LinkedIn, Instagram, Google Maps' },
]

export default function SettingsPage() {
  const { profile, applyTheme, refreshProfile, sectionPrefs, updateSectionPrefs } = useTheme()
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const { data: subscription = FREE_PLAN } = useSubscription()
  const [sectionSaving, setSectionSaving] = useState(false)
  const [sectionSuccess, setSectionSuccess] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [color, setColor] = useState('217 91% 60%')
  const [originalColor, setOriginalColor] = useState('217 91% 60%')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [clearLogo, setClearLogo] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name)
      setColor(profile.primary_color)
      setOriginalColor(profile.primary_color)
    }
  }, [profile])

  function handleColorChange(hsl: string) {
    setColor(hsl)
    applyTheme(hsl)
  }

  function handleCancel() {
    setColor(originalColor)
    applyTheme(originalColor)
    setLogoFile(null)
    setClearLogo(false)
    if (profile) setCompanyName(profile.company_name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!companyName.trim()) {
      setError('Le nom de société est obligatoire.')
      return
    }

    try {
      let logoUrl = clearLogo ? null : (profile?.logo_url ?? null)

      if (logoFile && user) {
        const ext = logoFile.name.split('.').pop()
        const path = `${user.id}/logo.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(path, logoFile, { upsert: true })
        if (uploadError) throw uploadError
        logoUrl = supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
      }

      await updateProfile.mutateAsync({ company_name: companyName.trim(), primary_color: color, logo_url: logoUrl })
      await refreshProfile()
      setOriginalColor(color)
      setLogoFile(null)
      setClearLogo(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.'
      setError(msg)
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

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Paramètres de votre espace</h2>
        <p className="text-sm text-muted-foreground mt-1">Personnalisez l'apparence de votre CRM.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Société */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Société</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Nom de la société</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Couleur */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Couleur principale</p>
          <ColorPicker value={color} onChange={handleColorChange} />
        </div>

        {/* Logo */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo</p>
          <LogoUpload
            currentUrl={clearLogo ? null : (profile?.logo_url ?? null)}
            onFile={setLogoFile}
            onClear={() => { setLogoFile(null); setClearLogo(true) }}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-700 bg-emerald-900/30 px-3 py-2 text-xs text-emerald-300">
            Paramètres sauvegardés.
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className={cn(
              'rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
              updateProfile.isPending && 'opacity-50 cursor-not-allowed'
            )}
          >
            {updateProfile.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </form>

      {/* Subscription */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Abonnement</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez votre plan Sky Social CRM.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {subscription.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <Zap size={13} /> Plan Pro
                  </span>
                ) : subscription.status === 'past_due' ? (
                  <span className="text-amber-400">Paiement en attente</span>
                ) : subscription.status === 'cancelled' ? (
                  <span className="text-muted-foreground">Plan annulé</span>
                ) : (
                  <span className="text-muted-foreground">Plan gratuit</span>
                )}
              </p>
              {subscription.status === 'active' && subscription.current_period_end && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actif jusqu'au {format(new Date(subscription.current_period_end), 'd MMM yyyy', { locale: fr })}
                </p>
              )}
              {subscription.status !== 'active' && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Limite : {subscription.prospect_limit} prospects
                </p>
              )}
            </div>
            {subscription.status !== 'active' && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
                  upgrading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Zap size={13} />
                {upgrading ? 'Redirection…' : 'Passer au Pro — 9€/mois'}
              </button>
            )}
          </div>
          {upgradeError && (
            <p className="text-xs text-red-400">{upgradeError}</p>
          )}
        </div>
      </div>

      {/* Section preferences */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Rubriques de la fiche prospect</h2>
          <p className="text-sm text-muted-foreground mt-1">Affichez ou masquez des sections sur chaque fiche.</p>
        </div>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {SECTION_LABELS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSectionToggle(key)}
                disabled={sectionSaving}
                className={cn(
                  'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  sectionPrefs[key] ? 'bg-primary' : 'bg-muted',
                  sectionSaving && 'opacity-50 cursor-not-allowed'
                )}
                role="switch"
                aria-checked={sectionPrefs[key]}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                    sectionPrefs[key] ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
        {sectionSuccess && (
          <p className="text-xs text-emerald-400">Préférences sauvegardées.</p>
        )}
      </div>
    </div>
  )
}
