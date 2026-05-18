'use client'

import { LocateFixed } from 'lucide-react'
import { useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'

interface LocateButtonProps {
  userLocation: { lat: number; lng: number } | null
  onRequest: () => void
  loading?: boolean
}

export function LocateButton({ userLocation, onRequest, loading = false }: LocateButtonProps) {
  const map = useMap()

  const handleClick = () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1 })
    } else {
      onRequest()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Usar minha localização"
      className={cn(
        'absolute bottom-20 right-4 z-[400] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 transition-colors',
        'hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 outline-none',
        loading && 'opacity-60 pointer-events-none',
      )}
    >
      <LocateFixed
        size={20}
        className={cn('text-blue-600', loading && 'animate-spin')}
      />
    </button>
  )
}
