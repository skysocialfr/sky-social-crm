import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAcceptInvite } from '@/hooks/useTeam'

type Status = 'idle' | 'accepting' | 'done' | 'error'

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const { session, loading: authLoading } = useAuth()
  const accept = useAcceptInvite()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !token || status !== 'idle') return
    if (!session) return // wait for login

    setStatus('accepting')
    accept.mutateAsync(token)
      .then(() => {
        setStatus('done')
        setTimeout(() => navigate('/app', { replace: true }), 1500)
      })
      .catch((err) => {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'acceptation.')
      })
  }, [authLoading, session, token, status, accept, navigate])

  if (!token) {
    return <CenteredCard title="Invitation invalide" body="Le lien d'invitation est invalide. Demandez à votre propriétaire d'équipe de vous renvoyer un lien." />
  }

  if (authLoading) {
    return <CenteredCard title="Chargement…" body="Vérification de votre session." />
  }

  if (!session) {
    const redirectAfterLogin = encodeURIComponent(`/invite/${token}`)
    return (
      <CenteredCard
        title="Connexion requise"
        body="Connectez-vous (ou créez votre compte) pour rejoindre l'équipe."
      >
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/login?next=${redirectAfterLogin}`}
            className="rounded-btn bg-primary px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary"
          >
            Se connecter
          </Link>
          <Link
            to={`/register?next=${redirectAfterLogin}`}
            className="rounded-btn border border-border px-5 py-2.5 text-center text-sm font-semibold text-text hover:bg-bg transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </CenteredCard>
    )
  }

  if (status === 'accepting') {
    return <CenteredCard title="Validation de l'invitation…" body="Un instant, on rattache votre compte à l'équipe." />
  }

  if (status === 'done') {
    return <CenteredCard title="Bienvenue dans l'équipe !" body="Redirection vers votre tableau de bord…" />
  }

  if (status === 'error') {
    return (
      <CenteredCard title="Invitation refusée" body={error}>
        <Link
          to="/app"
          className="mt-4 rounded-btn border border-border px-5 py-2.5 text-center text-sm font-semibold text-text hover:bg-bg transition-colors"
        >
          Retour à l'application
        </Link>
      </CenteredCard>
    )
  }

  return null
}

function CenteredCard({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-lg">
        <h1 className="text-xl font-bold text-text">{title}</h1>
        <p className="mt-2 text-sm text-muted">{body}</p>
        {children}
      </div>
    </div>
  )
}
