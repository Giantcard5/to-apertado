'use client'

import { use } from 'react'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useBathroomDetail } from '@/hooks/useBathroomDetail'
import { RatingForm } from '@/components/rating/RatingForm'
import { Skeleton } from '@/components/ui/Skeleton'

interface Props {
  params: Promise<{ id: string }>
}

export default function AvaliarPage({ params }: Props) {
  const { id } = use(params)
  const { isLoading: authLoading } = useProtectedRoute(`/avaliar/${id}`)
  const { data: bathroom, isLoading: dataLoading } = useBathroomDetail(id)

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!bathroom) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-gray-500">Banheiro não encontrado.</p>
      </div>
    )
  }

  return <RatingForm bathroomId={id} bathroomName={bathroom.name} />
}
