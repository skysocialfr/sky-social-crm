import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import type {
  CustomFieldsSchema,
  Team,
  TeamInvite,
  TeamMember,
  TeamScopes,
  TeamVisibilityMode,
} from '@/types'
import { normalizeSchema } from '@/types'

/** Returns the team row the current user belongs to. */
export function useTeam() {
  const { data: profile } = useUserProfile()
  return useQuery({
    queryKey: ['team', profile?.team_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile!.team_id!)
        .single()
      if (error) throw error
      return {
        ...(data as Team),
        custom_fields_schema: normalizeSchema(
          (data as { custom_fields_schema?: unknown }).custom_fields_schema,
        ),
      } as Team
    },
    enabled: !!profile?.team_id,
  })
}

/**
 * Returns the membership rows of the current team, hydrated with each
 * member's email + display name via the RPC `get_team_members`.
 */
export function useTeamMembers() {
  const { data: profile } = useUserProfile()
  return useQuery({
    queryKey: ['team-members', profile?.team_id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_team_members', {
        p_team_id: profile!.team_id!,
      })
      if (error) throw error
      return (data ?? []) as TeamMember[]
    },
    enabled: !!profile?.team_id,
  })
}

/** Returns the membership row for the current authenticated user. */
export function useCurrentMember() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile()
  return useQuery({
    queryKey: ['team-current-member', profile?.team_id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', profile!.team_id!)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data as TeamMember | null
    },
    enabled: !!profile?.team_id && !!user?.id,
  })
}

export function useIsTeamOwner() {
  const { data: member } = useCurrentMember()
  return member?.role === 'owner'
}

export function useTeamInvites() {
  const { data: profile } = useUserProfile()
  return useQuery({
    queryKey: ['team-invites', profile?.team_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('team_id', profile!.team_id!)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as TeamInvite[]
    },
    enabled: !!profile?.team_id,
  })
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

export function useRenameTeam() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', profile!.team_id!)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', profile?.team_id] })
    },
  })
}

export function useUpdateTeamSchema() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schema: CustomFieldsSchema) => {
      const { error } = await supabase
        .from('teams')
        .update({ custom_fields_schema: schema })
        .eq('id', profile!.team_id!)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', profile?.team_id] })
    },
  })
}

export function useUpdateMember() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      userId: string
      visibility_mode?: TeamVisibilityMode
      scopes?: TeamScopes
    }) => {
      const updates: Record<string, unknown> = {}
      if (vars.visibility_mode !== undefined) updates.visibility_mode = vars.visibility_mode
      if (vars.scopes !== undefined)          updates.scopes          = vars.scopes
      const { error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('team_id', profile!.team_id!)
        .eq('user_id', vars.userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', profile?.team_id] })
    },
  })
}

export function useRemoveMember() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', profile!.team_id!)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', profile?.team_id] })
    },
  })
}

export function useInviteMember() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      email: string
      visibility_mode: TeamVisibilityMode
      scopes: TeamScopes
    }) => {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) throw new Error('Not authenticated')
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-teammate`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          team_id: profile!.team_id,
          email: vars.email,
          visibility_mode: vars.visibility_mode,
          scopes: vars.scopes,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      return (await res.json()) as { invite_id: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', profile?.team_id] })
    },
  })
}

export function useCancelInvite() {
  const { data: profile } = useUserProfile()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', profile?.team_id] })
    },
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (token: string) => {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) throw new Error('Not authenticated')
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-team-invite`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      return (await res.json()) as { team_id: string }
    },
  })
}
