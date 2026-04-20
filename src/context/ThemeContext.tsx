import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile, SectionPrefs } from '@/types'
import { DEFAULT_SECTION_PREFS } from '@/types'

interface ThemeContextValue {
  profile: UserProfile | null
  isLoading: boolean
  sectionPrefs: SectionPrefs
  applyTheme: (color: string) => void
  refreshProfile: () => Promise<void>
  updateSectionPrefs: (prefs: SectionPrefs) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  profile: null,
  isLoading: true,
  sectionPrefs: DEFAULT_SECTION_PREFS,
  applyTheme: () => {},
  refreshProfile: async () => {},
  updateSectionPrefs: async () => {},
})

const STORAGE_KEY = 'sky-crm-primary'
const DEFAULT_COLOR = '217 91% 60%'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyTheme = useCallback((color: string) => {
    document.documentElement.style.setProperty('--primary', color)
    document.documentElement.style.setProperty('--ring', color)
    localStorage.setItem(STORAGE_KEY, color)
  }, [])

  // Applique la couleur en cache avant le premier paint (sans flash)
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

  const sectionPrefs: SectionPrefs = profile?.section_prefs ?? DEFAULT_SECTION_PREFS

  return (
    <ThemeContext.Provider value={{ profile, isLoading, sectionPrefs, applyTheme, refreshProfile, updateSectionPrefs }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
