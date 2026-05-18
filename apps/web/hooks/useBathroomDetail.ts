import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { BathroomDetail } from '@to-apertado/types'

interface BathroomDetailResponse {
  data: BathroomDetail
}

export function useBathroomDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.bathroom(id ?? ''),
    queryFn: () =>
      apiFetch<BathroomDetailResponse>(`/bathrooms/${id}`).then(r => r.data),
    enabled: id !== null,
    staleTime: 30_000,
  })
}
