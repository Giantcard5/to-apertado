'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { divIcon, type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { SP_CENTER } from '@/lib/leaflet-config'

const pinIcon = divIcon({
  html: `<div style="width:32px;height:40px;display:flex;align-items:flex-end;justify-content:center">
    <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
      <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28S28 21 28 12C28 5.373 22.627 0 16 0z" fill="#2563EB"/>
      <text x="16" y="16" text-anchor="middle" dominant-baseline="middle" font-size="11">📍</text>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
})

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface LocationPickerMapProps {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
}

export function LocationPickerMap({ lat, lng, onPick }: LocationPickerMapProps) {
  const center: LatLngExpression =
    lat !== null && lng !== null ? [lat, lng] : (SP_CENTER as LatLngExpression)

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <ClickHandler onPick={onPick} />
      {lat !== null && lng !== null && (
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const pos = e.target.getLatLng()
              onPick(pos.lat, pos.lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}
