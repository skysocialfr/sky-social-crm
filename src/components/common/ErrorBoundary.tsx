import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Local console for browser-side debugging during development,
    // remote Sentry capture for production triage. Sentry init is a
    // no-op when VITE_SENTRY_DSN isn't set, so this stays cheap.
    console.error('[ErrorBoundary]', error, info.componentStack)
    captureError(error, { componentStack: info.componentStack })
  }

  handleReload = () => {
    // Clearing the error before reload avoids a flash of the fallback
    // on the next render if reload() is async on some browsers.
    this.setState({ error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ error: null })
    window.location.hash = '#/'
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f4f6ff] px-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-[#e8eaf8] bg-white p-10 shadow-xl">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            <span className="text-white text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Une erreur est survenue</h1>
          <p className="text-sm text-gray-500">
            Pas de panique, vos données sont en sécurité. Rechargez la page pour reprendre votre travail.
          </p>
          {import.meta.env.DEV && this.state.error?.message && (
            <pre className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-left text-xs text-red-700 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              Recharger
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="rounded-xl border border-[#e8eaf8] px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }
}
