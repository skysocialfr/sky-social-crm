import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/common/AuthCard'
import { cn } from '@/lib/cn'

// Landing page of the "forgot password" email. By the time it renders,
// supabase-js has exchanged the recovery token in the URL for a session
// (useAuth's getSession() waits for that), so:
//   session present → let the user pick a new password
//   no session      → the link was invalid, already used, or expired
export default function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setSaving(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(
        /different from the old/i.test(msg)
          ? "Choisissez un mot de passe différent de l'ancien."
          : 'Impossible de mettre à jour le mot de passe. Réessayez.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-[#6b7280] text-sm">Chargement…</div>
    )
  }

  if (done) {
    return (
      <AuthCard title="Mot de passe mis à jour" subtitle="Vous êtes connecté. Utilisez ce nouveau mot de passe la prochaine fois.">
        <button
          onClick={() => navigate('/app')}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          Accéder à mon espace
        </button>
      </AuthCard>
    )
  }

  if (!session) {
    return (
      <AuthCard
        title="Lien invalide ou expiré"
        subtitle="Ce lien a déjà été utilisé ou n'est plus valable. Les liens de réinitialisation expirent au bout d'une heure."
      >
        <Link
          to="/forgot-password"
          className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          Demander un nouveau lien
        </Link>
        <Link to="/login" className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Retour à la connexion
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choisissez un nouveau mot de passe" subtitle={`Compte : ${session.user.email ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Nouveau mot de passe <span className="font-normal text-gray-400">(min. 8 caractères)</span>
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 pr-11 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input
            id="reset-confirm"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md',
            saving && 'opacity-50 cursor-not-allowed',
          )}
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </AuthCard>
  )
}
