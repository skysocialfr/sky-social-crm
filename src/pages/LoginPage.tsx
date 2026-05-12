import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      // Supabase handles the OAuth redirect dance — the user is sent to
      // accounts.google.com, picks an account, and bounces back to
      // /app via the redirectTo below.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/app')
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold">Velmio CRM</span>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight mb-4">
            Bienvenue sur votre<br />espace de prospection
          </h2>
          <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
            Gérez vos prospects, planifiez vos relances et suivez votre pipeline depuis un seul endroit.
          </p>
          <ul className="space-y-3">
            {[
              'Pipeline visuel Kanban & tableau',
              'Relances automatiques intelligentes',
              'Import CSV / Excel en un clic',
              'Personnalisation complète pour votre marque',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle2 size={16} className="text-indigo-200 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-indigo-300">Velmio © {new Date().getFullYear()}</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={13} />
            Retour à l'accueil
          </Link>

          <h1 className="text-2xl font-black text-gray-900 mb-1">Bon retour 👋</h1>
          <p className="text-sm text-gray-500 mb-6">Connectez-vous à votre espace CRM.</p>

          {/* Google SSO */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              aria-label="Se connecter avec Google"
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
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e4e7f8]" />
            <span className="text-[11px] text-gray-400">ou</span>
            <div className="flex-1 h-px bg-[#e4e7f8]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@votresociete.com"
                className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-600">Se souvenir de moi</span>
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md',
                loading && 'opacity-50 cursor-not-allowed'
              )}
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Créer votre espace
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
