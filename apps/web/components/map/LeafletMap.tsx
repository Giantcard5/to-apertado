'use client'

// This file is ALWAYS imported via:
// dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { SP_CENTER, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, CLUSTER_ZOOM_THRESHOLD } from '@/lib/leaflet-config'
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
  onMapMove,
  onPinClick,
  onLocateRequest,
  locateLoading = false,
  currentZoom = DEFAULT_ZOOM,
}: LeafletMapProps) {
  const useCluster = currentZoom < CLUSTER_ZOOM_THRESHOLD

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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapEvents onMove={onMapMove} />

      {useCluster ? (
        <MapCluster bathrooms={bathrooms} onPinClick={onPinClick} />
      ) : (
        bathrooms.map(b => (
          <BathroomPin key={b.id} bathroom={b} onClick={onPinClick} />
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
