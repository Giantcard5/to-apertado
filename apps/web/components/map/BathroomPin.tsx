import { divIcon } from 'leaflet'
import { Marker } from 'react-leaflet'
import { pinColor } from '@/lib/leaflet-config'
import type { BathroomPin as BathroomPinType } from '@to-apertado/types'

interface BathroomPinProps {
  bathroom: BathroomPinType
  onClick?: (bathroom: BathroomPinType) => void
}

function createPinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24S32 28 32 16C32 7.16 24.84 0 16 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif">🚻</text>
    </svg>`

  return divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

export function BathroomPin({ bathroom, onClick }: BathroomPinProps) {
  const color = pinColor(bathroom.avg_rating, bathroom.status)
  const icon  = createPinIcon(color)

  return (
    <Marker
      position={[bathroom.lat, bathroom.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick?.(bathroom) }}
    />
  )
}
