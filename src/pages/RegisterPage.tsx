import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'
import ColorPicker from '@/components/common/ColorPicker'
import LogoUpload from '@/components/common/LogoUpload'

const DEFAULT_COLOR = '217 91% 60%'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { applyTheme, refreshProfile } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  function handleColorChange(hsl: string) {
    setColor(hsl)
    applyTheme(hsl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !companyName) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { company_name: companyName } },
      })

      if (signUpError) throw signUpError

      if (!data.session) {
        setEmailSent(true)
        setLoading(false)
        return
      }

      const userId = data.user!.id

      let logoUrl: string | null = null
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${userId}/logo.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(path, logoFile, { upsert: true })
        if (!uploadError) {
          logoUrl = supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
        }
      }

      await supabase
        .from('user_profiles')
        .update({ primary_color: color, logo_url: logoUrl, company_name: companyName })
        .eq('id', userId)

      await refreshProfile()
      navigate('/app')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary">
            <Zap size={22} className="text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Vérifiez votre email</h1>
          <p className="text-sm text-muted-foreground">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
            Cliquez dessus pour activer votre espace.
          </p>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Zap size={22} className="text-primary-foreground" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Créer votre espace CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Votre CRM personnalisé en quelques secondes</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Infos de connexion */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connexion</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@votresociete.com"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Mot de passe * <span className="text-muted-foreground font-normal">(min. 8 caractères)</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Nom de la société */}
            <div className="border-t border-border pt-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Votre société</p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nom de la société *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Photopya, Ma Boîte, …"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Couleur */}
            <div className="border-t border-border pt-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Couleur principale</p>
              <ColorPicker value={color} onChange={handleColorChange} />
            </div>

            {/* Logo */}
            <div className="border-t border-border pt-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo <span className="normal-case font-normal text-muted-foreground">(optionnel)</span></p>
              <LogoUpload
                currentUrl={null}
                onFile={setLogoFile}
                onClear={() => setLogoFile(null)}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? 'Création en cours…' : 'Créer mon espace'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
