import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <p className="text-6xl font-black text-muted-foreground/30">404</p>
      <p className="text-xl font-semibold text-foreground">Page introuvable</p>
      <p className="text-sm text-muted-foreground">Cette page n'existe pas.</p>
      <button
        onClick={() => navigate('/app')}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retour au dashboard
      </button>
    </div>
  )
}
