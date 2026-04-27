import { useIsAdmin } from './useIsAdmin'

export function useIsSuperAdmin() {
  const { isAdmin, isLoading } = useIsAdmin()
  return { isSuperAdmin: isAdmin, isLoading }
}
