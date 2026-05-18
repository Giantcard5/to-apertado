import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

export type RankingEntry = {
  id: string
  name: string | null
  avatar_url: string | null
  total_points: number
}

type RankingResponse = {
  data: RankingEntry[]
  period: string
}

export function useRanking(period: 'week' | 'month' | 'all') {
  return useQuery({
    queryKey: queryKeys.rankings(period),
    queryFn: () =>
      apiFetch<RankingResponse>(`/ranking?period=${period}`).then(r => r.data),
    staleTime: 60_000,
  })
}
