import type { LatLngExpression } from 'leaflet'

export const SP_CENTER: LatLngExpression = [-23.5505, -46.6333]
export const DEFAULT_ZOOM = 14
export const MIN_ZOOM = 10
export const MAX_ZOOM = 19
export const CLUSTER_ZOOM_THRESHOLD = 14

/** Radius (meters) to fetch bathrooms based on zoom level */
export function radiusFromZoom(zoom: number): number {
  if (zoom >= 16) return 500
  if (zoom >= 14) return 1000
  if (zoom >= 12) return 3000
  return 5000
}

/** Color for pin based on avg_rating */
export function pinColor(avgRating: number | null, status: string): string {
  if (status === 'needs_review') return '#F97316'
  if (avgRating == null) return '#9CA3AF'
  if (avgRating >= 4) return '#2563EB'
  if (avgRating >= 2) return '#F59E0B'
  return '#DC2626'
}
