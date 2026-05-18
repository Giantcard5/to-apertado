'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Redirects unauthenticated users to /login?returnTo=<current-path>.
 * Use at the top of any page that requires authentication.
 */
export function useProtectedRoute(currentPath: string) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`)
    }
  }, [isAuthenticated, isLoading, router, currentPath])

  return { isAuthenticated, isLoading }
}
