'use client'

import { useCallback, useState } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  })

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocalização não suportada neste dispositivo.' }))
      return
    }
    setState(s => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        })
      },
      err => {
        setState(s => ({
          ...s,
          error: err.code === 1 ? 'Permissão de localização negada.' : 'Não foi possível obter sua localização.',
          loading: false,
        }))
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }, [])

  return { ...state, request }
}
