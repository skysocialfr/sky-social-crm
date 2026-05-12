import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SearchModal from './SearchModal'
import PastDueBanner from '@/components/billing/PastDueBanner'
import { ToastProvider } from '@/components/common/Toast'

export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f4f6ff' }}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onSearchOpen={() => setSearchOpen(true)} />
          <PastDueBanner />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
            <footer className="mt-8 hidden md:flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[#9ca3af]">
              <a href="#/legal/mentions" className="hover:text-indigo-600 transition-colors">Mentions légales</a>
              <span>·</span>
              <a href="#/legal/cgu" className="hover:text-indigo-600 transition-colors">CGU</a>
              <span>·</span>
              <a href="#/legal/confidentialite" className="hover:text-indigo-600 transition-colors">Confidentialité</a>
            </footer>
          </main>
        </div>
      </div>
      <BottomNav />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </ToastProvider>
  )
}
