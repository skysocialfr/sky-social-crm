import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile, SectionPrefs, NotificationPrefs, CustomFieldsSchema } from '@/types'
import { DEFAULT_SECTION_PREFS, DEFAULT_NOTIFICATION_PREFS, DEFAULT_CUSTOM_FIELDS_SCHEMA, normalizeSchema } from '@/types'
import { setSentryUser } from '@/lib/sentry'

interface ThemeContextValue {
  profile: UserProfile | null
  isLoading: boolean
  sectionPrefs: SectionPrefs
  notificationPrefs: NotificationPrefs
  customFieldsSchema: CustomFieldsSchema
  /** True if the current user is the owner of the active team — they alone can edit the team schema. */
  isTeamOwner: boolean
  isDark: boolean
  applyTheme: (color: string) => void
  toggleDark: () => void
  refreshProfile: () => Promise<void>
  updateSectionPrefs: (prefs: SectionPrefs) => Promise<void>
  updateNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>
  updateCustomFieldsSchema: (schema: CustomFieldsSchema) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  profile: null,
  isLoading: true,
  sectionPrefs: DEFAULT_SECTION_PREFS,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  customFieldsSchema: DEFAULT_CUSTOM_FIELDS_SCHEMA,
  isTeamOwner: false,
  isDark: false,
  applyTheme: () => {},
  toggleDark: () => {},
  refreshProfile: async () => {},
  updateSectionPrefs: async () => {},
  updateNotificationPrefs: async () => {},
  updateCustomFieldsSchema: async () => {},
})

const STORAGE_KEY = 'sky-crm-primary'
const DARK_STORAGE_KEY = 'sky-crm-dark'
const DEFAULT_COLOR = '245 85% 60%'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [teamSchema, setTeamSchema] = useState<CustomFieldsSchema>(DEFAULT_CUSTOM_FIELDS_SCHEMA)
  const [isTeamOwner, setIsTeamOwner] = useState(false)
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

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useLayoutEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COLOR
    applyTheme(cached)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load profile + team schema + owner status on auth change.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setTeamSchema(DEFAULT_CUSTOM_FIELDS_SCHEMA)
      setIsTeamOwner(false)
      setIsLoading(false)
      document.documentElement.style.removeProperty('--primary')
      document.documentElement.style.removeProperty('--ring')
      localStorage.removeItem(STORAGE_KEY)
      setSentryUser(null)
      return
    }

    setSentryUser({ id: user.id, email: user.email })
    setIsLoading(true)

    ;(async () => {
      const { data: profileRow } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileRow) {
        setProfile(profileRow as UserProfile)
        applyTheme((profileRow as UserProfile).primary_color)

        const teamId = (profileRow as UserProfile).team_id
        if (teamId) {
          const [teamRes, memberRes] = await Promise.all([
            supabase.from('teams').select('custom_fields_schema').eq('id', teamId).single(),
            supabase.from('team_members').select('role').eq('team_id', teamId).eq('user_id', user.id).maybeSingle(),
          ])
          setTeamSchema(normalizeSchema(teamRes.data?.custom_fields_schema))
          setIsTeamOwner(memberRes.data?.role === 'owner')
        }
      }
      setIsLoading(false)
    })()
  }, [user?.id, user?.email, applyTheme])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
      setProfile(data as UserProfile)
      applyTheme((data as UserProfile).primary_color)
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

  const updateCustomFieldsSchema = useCallback(async (schema: CustomFieldsSchema) => {
    if (!user || !profile?.team_id) return
    const { error } = await supabase
      .from('teams')
      .update({ custom_fields_schema: schema })
      .eq('id', profile.team_id)
    if (error) throw error
    setTeamSchema(schema)
  }, [user?.id, profile?.team_id])

  const sectionPrefs: SectionPrefs = profile?.section_prefs ?? DEFAULT_SECTION_PREFS
  const notificationPrefs: NotificationPrefs = profile?.notification_prefs ?? DEFAULT_NOTIFICATION_PREFS

  return (
    <ThemeContext.Provider value={{
      profile,
      isLoading,
      sectionPrefs,
      notificationPrefs,
      customFieldsSchema: teamSchema,
      isTeamOwner,
      isDark,
      applyTheme,
      toggleDark,
      refreshProfile,
      updateSectionPrefs,
      updateNotificationPrefs,
      updateCustomFieldsSchema,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
