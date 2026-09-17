import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/common/AuthCard'
import { cn } from '@/lib/cn'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      // Rate limiting is the only failure worth surfacing. Anything else
      // falls through to the same confirmation screen (anti-enumeration:
      // never reveal whether an address has an account — see RegisterPage).
      if (resetError && resetError.status === 429) {
        setError('Trop de demandes. Patientez une minute avant de réessayer.')
        return
      }
      setSent(true)
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Vérifiez votre boîte mail"
        subtitle={
          <>
            Si un compte existe pour <strong className="text-gray-700">{email.trim()}</strong>, un lien
            pour choisir un nouveau mot de passe vient d'être envoyé. Pensez à regarder dans les
            indésirables.
          </>
        }
      >
        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:underline">
          Retour à la connexion
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Mot de passe oublié ?"
      subtitle="Indiquez l'adresse email de votre compte. Nous vous enverrons un lien pour en choisir un nouveau."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@votresociete.com"
            className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-md',
            (loading || !email) && 'opacity-50 cursor-not-allowed',
          )}
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          {loading ? 'Envoi…' : 'Envoyer le lien'}
        </button>
      </form>

      <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeft size={13} />
        Retour à la connexion
      </Link>
    </AuthCard>
  )
}
