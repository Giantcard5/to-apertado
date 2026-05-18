import type { LatLngExpression } from 'leaflet'

export const SP_CENTER: LatLngExpression = [-23.5505, -46.6333]
export const DEFAULT_ZOOM = 14
export const MIN_ZOOM = 10
export const MAX_ZOOM = 19
export const CLUSTER_ZOOM_THRESHOLD = 14

export const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'

/** Radius (meters) to fetch bathrooms based on zoom level */
export function radiusFromZoom(zoom: number): number {
  if (zoom >= 16) return 500
  if (zoom >= 14) return 1000
  if (zoom >= 12) return 3000
  return 5000
}

/** Color for pin based on avg_rating — matches new brand palette */
export function pinColor(avgRating: number | null, status: string): string {
  if (status === 'needs_review') return '#FF6B35'
  if (avgRating == null) return '#9BAAB8'
  if (avgRating >= 4) return '#1A6BFF'
  if (avgRating >= 2) return '#FFB547'
  return '#FF4757'
}
