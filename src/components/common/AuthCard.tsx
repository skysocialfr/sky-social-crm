import { Zap } from 'lucide-react'

// Centered card used by the small standalone auth screens (forgot /
// reset password) — same look as the "check your inbox" screen of
// RegisterPage.
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#f4f6ff] px-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#e8eaf8] bg-white p-8 shadow-xl">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        >
          <Zap size={22} className="text-white" fill="currentColor" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
