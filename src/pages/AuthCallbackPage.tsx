import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Landing route for the OAuth redirect (Google, etc.).
 *
 * The Supabase client (detectSessionInUrl) exchanges the `?code=` returned by
 * the provider for a session during initialization. We wait for that session
 * here — deterministically, before any protected-route guard runs — then route
 * the user on. This avoids the race where the guard sees a null session and
 * bounces back to /login while the exchange is still in flight.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let settled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) {
        settled = true
        navigate('/app', { replace: true })
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (settled) return
      settled = true
      navigate(session ? '/app' : '/login', { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="flex h-screen items-center justify-center text-sm text-[#6b7280]">
      Connexion en cours…
    </div>
  )
}
