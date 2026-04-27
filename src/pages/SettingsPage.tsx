import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Zap, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { useUpdateProfile } from '@/hooks/useUserProfile'
import { useSubscription, createCheckoutSession, FREE_PLAN, PLAN_DETAILS, type SubscriptionPlan } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { useProspects } from '@/hooks/useProspects'
import { exportProspectsToCsv } from '@/lib/csvUtils'
import { cn } from '@/lib/cn'
import ColorPicker from '@/components/common/ColorPicker'
import LogoUpload from '@/components/common/LogoUpload'
import type { SectionPrefs, NotificationPrefs } from '@/types'

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

const NOTIF_LABELS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'email_relances_overdue', label: 'Relances en retard',     description: 'Email quotidien si des relances sont dues.' },
  { key: 'email_weekly_recap',     label: 'Récapitulatif hebdo',    description: 'Résumé chaque lundi : nouveaux prospects, deals avancés.' },
  { key: 'email_new_prospect',     label: 'Nouveau prospect ajouté',description: 'Confirmation par email à chaque ajout.' },
]

export default function SettingsPage() {
  const { profile, applyTheme, refreshProfile, sectionPrefs, updateSectionPrefs, notificationPrefs, updateNotificationPrefs } = useTheme()
  const { user, logout } = useAuth()
  const updateProfile = useUpdateProfile()
  const { data: subscription = FREE_PLAN } = useSubscription()
  const { data: prospects = [] } = useProspects()

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
  const [upgrading, setUpgrading] = useState<SubscriptionPlan | null>(null)
  const [upgradeError, setUpgradeError] = useState('')

  // Sécurité
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Notifications
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSuccess, setNotifSuccess] = useState(false)

  // Données — suppression compte
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const handleUpgrade = async (plan: 'pro' | 'team') => {
    setUpgradeError('')
    setUpgrading(plan)
    try {
      const url = await createCheckoutSession(window.location.href, plan)
      window.location.href = url
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setUpgrading(null)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 8) { setPwError('Le mot de passe doit faire au moins 8 caractères.'); return }
    if (newPassword !== confirmPassword) { setPwError('Les deux mots de passe ne correspondent pas.'); return }
    setPwSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 4000)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setPwSaving(false)
    }
  }

  const handleNotifToggle = async (key: keyof NotificationPrefs) => {
    const next: NotificationPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotifSaving(true)
    try {
      await updateNotificationPrefs(next)
      setNotifSuccess(true)
      setTimeout(() => setNotifSuccess(false), 2000)
    } finally {
      setNotifSaving(false)
    }
  }

  const handleExportProspects = () => {
    exportProspectsToCsv(prospects)
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (deleteConfirm !== 'SUPPRIMER') {
      setDeleteError('Tape "SUPPRIMER" en majuscules pour confirmer.')
      return
    }
    setDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_my_account')
      if (error) throw error
      await logout()
      window.location.href = '/'
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setDeleting(false)
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

        {/* Current status */}
        <div className="rounded-card border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Plan actuel</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-text">
                {subscription.status === 'active' ? (
                  <span className="text-crm-green flex items-center gap-1.5">
                    <Zap size={13} /> Plan {PLAN_DETAILS[subscription.plan].label}
                  </span>
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
                  Renouvellement le {format(new Date(subscription.current_period_end), 'd MMM yyyy', { locale: fr })}
                </p>
              )}
              <p className="text-[11px] text-muted mt-0.5">
                Limite : {subscription.prospect_limit >= 9999 ? 'illimité' : subscription.prospect_limit} prospects
              </p>
            </div>
          </div>
          {upgradeError && <p className="text-xs text-crm-red mt-3">{upgradeError}</p>}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['pro', 'team'] as const).map((planKey) => {
            const plan = PLAN_DETAILS[planKey]
            const isCurrent = subscription.status === 'active' && subscription.plan === planKey
            const isLoading = upgrading === planKey
            return (
              <div
                key={planKey}
                className={cn(
                  'rounded-card border bg-card p-5 flex flex-col gap-4 transition-all',
                  isCurrent ? 'border-primary shadow-primary' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text flex items-center gap-1.5">
                      {plan.label}
                      {planKey === 'team' && (
                        <span className="text-[9px] font-extrabold text-primary bg-primary-light border border-primary-border rounded-[4px] px-[6px] py-[2px] tracking-[0.06em]">
                          POPULAIRE
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{plan.price}</p>
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-crm-green-light border border-crm-green px-2 py-0.5 text-[10px] font-semibold text-crm-green">
                      <Check size={10} /> Actif
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[12px] text-text">
                      <Check size={13} className="text-crm-green flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleUpgrade(planKey)}
                  disabled={isCurrent || upgrading !== null}
                  className={cn(
                    'mt-auto flex items-center justify-center gap-1.5 rounded-btn px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-50',
                    isCurrent
                      ? 'border border-border bg-card text-muted cursor-default'
                      : 'bg-primary text-white hover:bg-primary-hover shadow-primary'
                  )}
                >
                  {isCurrent
                    ? 'Plan actuel'
                    : isLoading
                      ? 'Redirection…'
                      : subscription.status === 'active'
                        ? `Passer au ${plan.label}`
                        : `Choisir ${plan.label}`}
                </button>
              </div>
            )
          })}
        </div>

        {subscription.status === 'active' && (
          <p className="text-[11px] text-muted">
            Pour annuler ou modifier votre moyen de paiement, contactez le support.
          </p>
        )}
      </div>
    ),

    securite: (
      <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Sécurité</h2>
          <p className="text-[13px] text-muted mt-0.5">Gérez votre mot de passe et la sécurité du compte.</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Email</p>
          <p className="text-sm text-text">{user?.email}</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Changer le mot de passe</p>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text">Nouveau mot de passe</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        {pwError && (
          <p className="rounded-btn border border-crm-red bg-crm-red-light px-3 py-2 text-xs text-crm-red">{pwError}</p>
        )}
        {pwSuccess && (
          <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
            Mot de passe mis à jour. Tu pourras te reconnecter avec le nouveau.
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={pwSaving || !newPassword || !confirmPassword}
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-primary"
          >
            {pwSaving ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </div>
      </form>
    ),

    notifications: (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Notifications</h2>
          <p className="text-[13px] text-muted mt-0.5">Choisissez les emails que vous souhaitez recevoir.</p>
        </div>
        <div className="rounded-card border border-border bg-card divide-y divide-border">
          <div className="px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Emails</p>
          </div>
          {NOTIF_LABELS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-text">{label}</p>
                <p className="text-[11px] text-muted">{description}</p>
              </div>
              <Toggle
                checked={notificationPrefs[key]}
                onChange={() => handleNotifToggle(key)}
                disabled={notifSaving}
              />
            </div>
          ))}
        </div>
        {notifSuccess && (
          <p className="rounded-btn border border-crm-green bg-crm-green-light px-3 py-2 text-xs text-crm-green">
            Préférences sauvegardées.
          </p>
        )}
      </div>
    ),

    donnees: (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-text">Données</h2>
          <p className="text-[13px] text-muted mt-0.5">Exportez vos données ou supprimez votre compte.</p>
        </div>

        <div className="rounded-card border border-border bg-card p-5 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Export</p>
          <p className="text-sm text-text">
            Télécharger l'ensemble de vos prospects au format CSV ({prospects.length} {prospects.length > 1 ? 'fiches' : 'fiche'}).
          </p>
          <div>
            <button
              type="button"
              onClick={handleExportProspects}
              disabled={prospects.length === 0}
              className="rounded-btn border border-border bg-card px-4 py-2 text-xs font-semibold text-text hover:bg-bg disabled:opacity-50 transition-colors"
            >
              Exporter les prospects (CSV)
            </button>
          </div>
        </div>

        <div className="rounded-card border border-crm-red bg-crm-red-light p-5 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-crm-red">Zone dangereuse</p>
          <p className="text-sm font-bold text-text">Supprimer mon compte</p>
          <p className="text-[12px] text-muted">
            Supprime définitivement vos prospects, interactions et préférences. Cette action est irréversible.
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text">
              Pour confirmer, tape <span className="font-mono bg-card px-1.5 py-0.5 rounded">SUPPRIMER</span>
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full max-w-xs rounded-btn border border-border bg-card px-3 py-2 text-sm text-text focus:border-crm-red focus:outline-none"
              placeholder="SUPPRIMER"
            />
          </div>
          {deleteError && <p className="text-xs text-crm-red">{deleteError}</p>}
          <div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== 'SUPPRIMER'}
              className="rounded-btn bg-crm-red px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {deleting ? 'Suppression…' : 'Supprimer définitivement mon compte'}
            </button>
          </div>
        </div>
      </div>
    ),

    integrations: <ComingSoon label="Intégrations" />,
    equipe: <ComingSoon label="Équipe" />,
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
