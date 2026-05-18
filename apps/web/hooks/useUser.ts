import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { User } from '@to-apertado/types'

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => apiFetch<User>('/me'),
    staleTime: 60_000,
    retry: false, // 401 = unauthenticated, no retry needed
  })
}
