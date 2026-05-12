import * as Sentry from '@sentry/react'

// Initializes Sentry only when a DSN is configured (VITE_SENTRY_DSN).
// Without the env var the calls become no-ops, so local dev and previews
// keep working without an account. Free tier (5k errors / month) is
// enough for early production.

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined

export function initSentry() {
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Release tag uses the build-time commit SHA if available so issues
    // can be tied back to the exact code shipped to GitHub Pages.
    release: import.meta.env.VITE_COMMIT_SHA as string | undefined,
    // Lightweight defaults — we're on the free tier and don't need
    // performance traces or session replay yet.
    tracesSampleRate: 0,
    integrations: [],
    // Drop noise that's never actionable.
    ignoreErrors: [
      // Network blips from the browser losing/regaining connectivity.
      'NetworkError when attempting to fetch resource',
      'Failed to fetch',
      'Load failed',
      // ResizeObserver warning fired by Chrome that's harmless.
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],
  })
}

// Lets the auth layer pin the current user onto every captured event
// so each error reaches us with enough context to diagnose without
// asking the customer for their account id.
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (!dsn) return
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email ?? undefined })
  } else {
    Sentry.setUser(null)
  }
}

// Manual capture helper used by the ErrorBoundary fallback so we can
// log errors that React caught before the user reloaded the page.
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!dsn) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
