import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { BathroomPin } from '@to-apertado/types'

export interface BathroomsParams {
  lat: number
  lng: number
  radius?: number
  type?: string
  free?: boolean
  accessible?: boolean
}

interface BathroomsResponse {
  data: BathroomPin[]
}

export function useBathrooms(params: BathroomsParams | null) {
  return useQuery({
    queryKey: queryKeys.bathrooms(params ?? {}),
    queryFn: () => {
      if (!params) return { data: [] as BathroomPin[] }
      const sp = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        ...(params.radius   != null && { radius:     String(params.radius) }),
        ...(params.type                && { type:       params.type }),
        ...(params.free     != null && { free:       String(params.free) }),
        ...(params.accessible != null && { accessible: String(params.accessible) }),
      })
      return apiFetch<BathroomsResponse>(`/bathrooms?${sp}`)
    },
    enabled: params !== null,
    select: res => res.data,
  })
}
