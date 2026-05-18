import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const queryKeys = {
  bathrooms: (params: object) => ['bathrooms', params] as const,
  bathroom:  (id: string)                       => ['bathroom', id] as const,
  rankings:  (period: string)                   => ['rankings', period] as const,
  user:      ()                                 => ['user'] as const,
}
