'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap').then(m => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-none" />,
  },
)

interface Step1LocationProps {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
}

export function Step1Location({ lat, lng, onPick }: Step1LocationProps) {
  const [locating, setLocating] = useState(false)

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        onPick(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Toque no mapa para marcar a localização do banheiro.
      </p>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
        <LocationPickerMap lat={lat} lng={lng} onPick={onPick} />
      </div>

      <Button
        variant="secondary"
        onClick={useMyLocation}
        disabled={locating}
        className="flex items-center gap-2"
      >
        <LocateFixed size={16} />
        {locating ? 'Localizando...' : 'Usar minha localização'}
      </Button>

      {lat !== null && lng !== null && (
        <p className="text-center text-xs text-gray-400">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
