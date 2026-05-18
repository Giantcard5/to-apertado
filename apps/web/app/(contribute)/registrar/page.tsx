'use client'

import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { RegisterForm } from '@/components/registration/RegisterForm'
import { Skeleton } from '@/components/ui/Skeleton'

export default function RegistrarPage() {
  const { isLoading } = useProtectedRoute('/registrar')

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return <RegisterForm />
}
