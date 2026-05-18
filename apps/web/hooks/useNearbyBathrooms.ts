'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SP_CENTER, radiusFromZoom } from '@/lib/leaflet-config'
import { useGeolocation } from './useGeolocation'
import { useBathrooms, type BathroomsParams } from './useBathrooms'

interface MapState {
  lat: number
  lng: number
  zoom: number
}

const DEFAULT_STATE: MapState = {
  lat: (SP_CENTER as number[])[0],
  lng: (SP_CENTER as number[])[1],
  zoom: 14,
}

export function useNearbyBathrooms(filters: Omit<BathroomsParams, 'lat' | 'lng' | 'radius'> = {}) {
  const geo = useGeolocation()
  const [mapState, setMapState] = useState<MapState>(DEFAULT_STATE)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Request geolocation once on mount
  useEffect(() => { geo.request() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When geolocation resolves, center the map on the user
  useEffect(() => {
    if (geo.lat && geo.lng) {
      setMapState(s => ({ ...s, lat: geo.lat!, lng: geo.lng! }))
    }
  }, [geo.lat, geo.lng])

  const onMapMove = useCallback((lat: number, lng: number, zoom: number) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setMapState({ lat, lng, zoom })
    }, 300)
  }, [])

  const bathroomsQuery = useBathrooms({
    lat: mapState.lat,
    lng: mapState.lng,
    radius: radiusFromZoom(mapState.zoom),
    ...filters,
  })

  return {
    mapState,
    onMapMove,
    userLocation: geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : null,
    bathrooms: bathroomsQuery.data ?? [],
    isLoading: bathroomsQuery.isLoading,
    error: bathroomsQuery.error,
  }
}
