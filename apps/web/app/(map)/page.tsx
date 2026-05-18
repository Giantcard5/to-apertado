'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { SP_CENTER } from '@/lib/leaflet-config'
import { useNearbyBathrooms } from '@/hooks/useNearbyBathrooms'
import { MapFilters, type MapFilterState } from '@/components/map/MapFilters'
import { BathroomSheet } from '@/components/bathroom/BathroomSheet'
import { Skeleton } from '@/components/ui/Skeleton'
import type { BathroomPin } from '@to-apertado/types'

// Leaflet MUST be imported with ssr: false
const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    ),
  },
)

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilterState>({})
  const [selectedBathroom, setSelectedBathroom] = useState<BathroomPin | null>(null)
  const [zoom, setZoom] = useState(14)

  const {
    mapState,
    onMapMove,
    userLocation,
    bathrooms,
    isLoading,
  } = useNearbyBathrooms({
    free:       filters.free,
    accessible: filters.accessible,
    type:       filters.type,
  })

  const handleMapMove = (lat: number, lng: number, z: number) => {
    setZoom(z)
    onMapMove(lat, lng, z)
  }

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : (SP_CENTER as [number, number])

  return (
    <div className="relative h-full w-full">
      {/* Filters overlay — z-[1000] stays above all Leaflet layers (max ~700) */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex flex-col">
        <MapFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Map */}
      <LeafletMap
        bathrooms={bathrooms}
        center={center}
        userLocation={userLocation}
        onMapMove={handleMapMove}
        onPinClick={setSelectedBathroom}
        onLocateRequest={() => {}}
        currentZoom={zoom}
      />

      {/* Bottom sheet — 2-stage: peek (32vh) → full (90vh) */}
      <BathroomSheet
        bathroom={selectedBathroom}
        onClose={() => setSelectedBathroom(null)}
      />

      {isLoading && (
        <div className="absolute left-4 top-14 z-[1000] flex items-center gap-2 rounded-full glass shadow-card px-4 py-2 text-xs font-medium text-text-muted dark:glass-dark dark:text-gray-400">
          <span className="flex gap-0.5">
            {[0,1,2].map(i => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </span>
          Buscando banheiros próximos
        </div>
      )}
    </div>
  )
}
