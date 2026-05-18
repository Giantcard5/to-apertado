'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo)
    }
  }, [isAuthenticated, isLoading, router, returnTo])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🚻</div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Tô Apertado
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Banheiros de SP — rápido, honesto, crowdsourced.
          </p>
        </div>

        <GoogleSignInButton returnTo={returnTo} />

        <p className="mt-4 text-center text-xs text-gray-400">
          Sem senha. Conta Google em segundos.
        </p>
      </div>
    </div>
  )
}
