'use client'

import { LocateFixed, Locate } from 'lucide-react'
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

  const isLocated = !!userLocation

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLocated ? 'Centralizar na minha localização' : 'Usar minha localização'}
      className={cn(
        'absolute bottom-24 right-4 z-[400]',
        'flex h-12 w-12 items-center justify-center rounded-2xl',
        'transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2',
        isLocated
          ? 'bg-primary text-white shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-primary-sm'
          : 'bg-white text-text-muted shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 dark:bg-gray-800 dark:text-gray-300',
        loading && 'pointer-events-none',
      )}
    >
      {/* Pulse ring when loading */}
      {loading && (
        <span className="absolute inset-0 rounded-2xl bg-primary animate-pulse-ring opacity-60" />
      )}

      {isLocated ? (
        <LocateFixed size={20} strokeWidth={2.5} />
      ) : (
        <Locate size={20} strokeWidth={2} className={loading ? 'animate-pulse' : ''} />
      )}
    </button>
  )
}
