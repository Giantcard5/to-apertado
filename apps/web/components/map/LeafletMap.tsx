'use client'

// This file is ALWAYS imported via:
// dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import {
  SP_CENTER, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, CLUSTER_ZOOM_THRESHOLD,
  TILE_LIGHT, TILE_DARK, TILE_ATTRIBUTION,
} from '@/lib/leaflet-config'
import { BathroomPin } from './BathroomPin'
import { MapCluster } from './MapCluster'
import { LocateButton } from './LocateButton'
import type { BathroomPin as BathroomPinType } from '@to-apertado/types'

interface MapEventsProps {
  onMove: (lat: number, lng: number, zoom: number) => void
}

function MapEvents({ onMove }: MapEventsProps) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter()
      onMove(c.lat, c.lng, e.target.getZoom())
    },
    zoomend(e) {
      const c = e.target.getCenter()
      onMove(c.lat, c.lng, e.target.getZoom())
    },
  })
  return null
}

interface LeafletMapProps {
  bathrooms: BathroomPinType[]
  center: [number, number]
  zoom?: number
  userLocation: { lat: number; lng: number } | null
  selectedId?: string | null
  onMapMove: (lat: number, lng: number, zoom: number) => void
  onPinClick?: (bathroom: BathroomPinType) => void
  onLocateRequest: () => void
  locateLoading?: boolean
  currentZoom?: number
}

export default function LeafletMap({
  bathrooms,
  center,
  zoom = DEFAULT_ZOOM,
  userLocation,
  selectedId,
  onMapMove,
  onPinClick,
  onLocateRequest,
  locateLoading = false,
  currentZoom = DEFAULT_ZOOM,
}: LeafletMapProps) {
  const useCluster = currentZoom < CLUSTER_ZOOM_THRESHOLD

  // Detect dark mode for tile switching
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const html = document.documentElement
    const check = () => setIsDark(html.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const tileUrl = isDark ? TILE_DARK : TILE_LIGHT

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key={tileUrl}
        url={tileUrl}
        attribution={TILE_ATTRIBUTION}
        maxZoom={MAX_ZOOM}
      />

      <MapEvents onMove={onMapMove} />

      {useCluster ? (
        <MapCluster bathrooms={bathrooms} onPinClick={onPinClick} selectedId={selectedId} />
      ) : (
        bathrooms.map(b => (
          <BathroomPin
            key={b.id}
            bathroom={b}
            onClick={onPinClick}
            selected={b.id === selectedId}
          />
        ))
      )}

      <LocateButton
        userLocation={userLocation}
        onRequest={onLocateRequest}
        loading={locateLoading}
      />
    </MapContainer>
  )
}
