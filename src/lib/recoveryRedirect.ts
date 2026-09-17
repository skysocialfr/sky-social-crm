// Side-effect module — must stay the FIRST import of main.tsx.
//
// A password-recovery link signs the user in and lands on the redirect
// URL with `#…&type=recovery` in the hash. If that URL isn't in the
// Supabase allow-list, Supabase falls back to the Site URL ("/"), where
// the landing page would see a session and bounce straight to /app — the
// user ends up logged in without ever being asked for a new password.
//
// Rewriting the path here, before the router module reads the location,
// guarantees every recovery link ends on /reset-password. The hash is
// kept intact so supabase-js can still exchange it for a session.
const { pathname, hash } = window.location

if (pathname !== '/reset-password' && /[#&]type=recovery(&|$)/.test(hash)) {
  window.history.replaceState(null, '', `/reset-password${hash}`)
}

export {}
