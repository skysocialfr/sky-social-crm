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
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

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
      setError(msg)
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@votresociete.com"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mot de passe * <span className="font-normal text-gray-400">(min. 8 caractères)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nom de la société *</label>
                <input
                  type="text"
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
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
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
