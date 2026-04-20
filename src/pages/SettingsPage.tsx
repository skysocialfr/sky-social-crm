import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { useUpdateProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import ColorPicker from '@/components/common/ColorPicker'
import LogoUpload from '@/components/common/LogoUpload'

export default function SettingsPage() {
  const { profile, applyTheme, refreshProfile } = useTheme()
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

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
    </div>
  )
}
