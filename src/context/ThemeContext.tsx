import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile, SectionPrefs, NotificationPrefs } from '@/types'
import { DEFAULT_SECTION_PREFS, DEFAULT_NOTIFICATION_PREFS } from '@/types'

interface ThemeContextValue {
  profile: UserProfile | null
  isLoading: boolean
  sectionPrefs: SectionPrefs
  notificationPrefs: NotificationPrefs
  isDark: boolean
  applyTheme: (color: string) => void
  toggleDark: () => void
  refreshProfile: () => Promise<void>
  updateSectionPrefs: (prefs: SectionPrefs) => Promise<void>
  updateNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  profile: null,
  isLoading: true,
  sectionPrefs: DEFAULT_SECTION_PREFS,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  isDark: false,
  applyTheme: () => {},
  toggleDark: () => {},
  refreshProfile: async () => {},
  updateSectionPrefs: async () => {},
  updateNotificationPrefs: async () => {},
})

const STORAGE_KEY = 'sky-crm-primary'
const DARK_STORAGE_KEY = 'sky-crm-dark'
const DEFAULT_COLOR = '245 85% 60%'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(DARK_STORAGE_KEY) === 'true' } catch { return false }
  })

  const applyTheme = useCallback((color: string) => {
    document.documentElement.style.setProperty('--primary', color)
    document.documentElement.style.setProperty('--ring', color)
    localStorage.setItem(STORAGE_KEY, color)
  }, [])

  const toggleDark = useCallback(() => {
    setIsDark(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      try { localStorage.setItem(DARK_STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  // Sync dark class on mount (in case state diverged from the inline script)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Apply cached primary color before first paint
  useLayoutEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COLOR
    applyTheme(cached)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setIsLoading(false)
      document.documentElement.style.removeProperty('--primary')
      document.documentElement.style.removeProperty('--ring')
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    setIsLoading(true)
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as UserProfile)
          applyTheme(data.primary_color)
        }
        setIsLoading(false)
      })
  }, [user?.id, applyTheme])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
      setProfile(data as UserProfile)
      applyTheme(data.primary_color)
    }
  }, [user?.id, applyTheme])

  const updateSectionPrefs = useCallback(async (prefs: SectionPrefs) => {
    if (!user) return
    const { error } = await supabase
      .from('user_profiles')
      .update({ section_prefs: prefs })
      .eq('id', user.id)
    if (error) throw error
    setProfile(prev => prev ? { ...prev, section_prefs: prefs } : prev)
  }, [user?.id])

  const updateNotificationPrefs = useCallback(async (prefs: NotificationPrefs) => {
    if (!user) return
    const { error } = await supabase
      .from('user_profiles')
      .update({ notification_prefs: prefs })
      .eq('id', user.id)
    if (error) throw error
    setProfile(prev => prev ? { ...prev, notification_prefs: prefs } : prev)
  }, [user?.id])

  const sectionPrefs: SectionPrefs = profile?.section_prefs ?? DEFAULT_SECTION_PREFS
  const notificationPrefs: NotificationPrefs = profile?.notification_prefs ?? DEFAULT_NOTIFICATION_PREFS

  return (
    <ThemeContext.Provider value={{ profile, isLoading, sectionPrefs, notificationPrefs, isDark, applyTheme, toggleDark, refreshProfile, updateSectionPrefs, updateNotificationPrefs }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
