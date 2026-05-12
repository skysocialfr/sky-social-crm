import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'
import ColorPicker from '@/components/common/ColorPicker'
import LogoUpload from '@/components/common/LogoUpload'

const DEFAULT_COLOR = '217 91% 60%'
const STEPS = ['Votre compte', 'Votre société']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { applyTheme, refreshProfile } = useTheme()

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleSignup = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      // signInWithOAuth doubles as a sign-up flow on Supabase: if the
      // returned Google email has no auth.users row, one is created
      // on the fly (and the user_profiles trigger fires the same way).
      // company_name stays empty for these accounts — the user can
      // fill it in Settings → Mon compte after landing on /app.
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion Google indisponible.')
      setGoogleLoading(false)
    }
  }

  function handleColorChange(hsl: string) {
    setColor(hsl)
    applyTheme(hsl)
  }

  function nextStep() {
    setError('')
    if (step === 0) {
      if (!email || !password || !confirm) { setError('Veuillez remplir tous les champs.'); return }
      if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
      if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    }
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName) { setError('Veuillez renseigner le nom de votre société.'); return }
    setError('')
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName },
          // Force the post-confirmation redirect to the actual app origin
          // (e.g. https://skysocialfr.github.io/sky-social-crm/) so we no
          // longer depend on the project's Site URL setting, which silently
          // strips the path on some Supabase projects.
          emailRedirectTo: window.location.origin + window.location.pathname,
        },
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
      // Anti-enumeration: never reveal that an email already has an account.
      // Show the same "check your inbox" confirmation as a successful signup
      // so an attacker can't probe which addresses are registered.
      if (/already|registered|exist/i.test(msg)) {
        setEmailSent(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6ff] px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="w-full max-w-sm text-center space-y-4 rounded-2xl border border-[#e8eaf8] bg-white p-10 shadow-xl">
          <div
            className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Vérifiez votre email</h1>
          <p className="text-sm text-gray-500">
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
            Cliquez dessus pour activer votre espace.
          </p>
          <Link to="/login" className="text-sm text-indigo-600 font-medium hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6ff] px-4 py-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            <Zap size={22} className="text-white" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Créer votre espace CRM</h1>
            <p className="text-sm text-gray-500 mt-1">Prêt en 30 secondes, sans carte bancaire</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                    i < step
                      ? 'bg-emerald-100 text-emerald-600'
                      : i === step
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-400'
                  )}
                  style={i === step ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)' } : undefined}
                >
                  {i < step ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium', i === step ? 'text-indigo-600' : 'text-gray-400')}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-px w-12 mx-1', i < step ? 'bg-emerald-300' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #7c3aed)',
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#e8eaf8] bg-white p-6 shadow-xl">

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-base font-bold text-gray-900">Informations de connexion</h2>
                <p className="text-xs text-gray-500 mt-0.5">Ces identifiants vous serviront à vous connecter.</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading || loading}
                aria-label="S'inscrire avec Google"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e4e7f8] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-[#f7f8ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'Redirection…' : 'Continuer avec Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#e4e7f8]" />
                <span className="text-[11px] text-gray-400">ou par email</span>
                <div className="flex-1 h-px bg-[#e4e7f8]" />
              </div>

              <div>
                <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@votresociete.com"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mot de passe * <span className="font-normal text-gray-400">(min. 8 caractères)</span>
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
              >
                Continuer
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 1: Company + customization */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-2">
                <h2 className="text-base font-bold text-gray-900">Votre société</h2>
                <p className="text-xs text-gray-500 mt-0.5">Personnalisez votre espace CRM.</p>
              </div>
              <div>
                <label htmlFor="register-company" className="mb-1.5 block text-sm font-medium text-gray-700">Nom de la société *</label>
                <input
                  id="register-company"
                  type="text"
                  autoComplete="organization"
                  required
                  aria-required="true"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Photopya, Ma Boîte, …"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Couleur principale</p>
                <ColorPicker value={color} onChange={handleColorChange} />
              </div>
              <div className="border-t border-[#e8eaf8] pt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Logo <span className="font-normal text-gray-400">(optionnel)</span>
                </p>
                <LogoUpload currentUrl={null} onFile={setLogoFile} onClear={() => setLogoFile(null)} />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(0); setError('') }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#e8eaf8] px-4 py-3 text-sm font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                >
                  {loading ? 'Création en cours…' : 'Créer mon espace'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
