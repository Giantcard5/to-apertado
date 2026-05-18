import { divIcon } from 'leaflet'
import { Marker } from 'react-leaflet'
import { pinColor } from '@/lib/leaflet-config'
import type { BathroomPin as BathroomPinType } from '@to-apertado/types'

interface BathroomPinProps {
  bathroom: BathroomPinType
  onClick?: (bathroom: BathroomPinType) => void
  selected?: boolean
}

function createPinIcon(color: string, selected = false) {
  const scale = selected ? 1.2 : 1
  const w = Math.round(40 * scale)
  const h = Math.round(52 * scale)

  // Custom SVG pin: rounded drop with flat bottom point, person icon (no emoji)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 40 52" style="filter:${selected ? `drop-shadow(0 4px 12px ${color}80)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'}">
      <!-- Pin body -->
      <path d="M20 0C9.954 0 2 7.954 2 18c0 7.18 4.09 13.39 10 16.48L20 52l8-17.52C33.91 31.39 38 25.18 38 18 38 7.954 30.046 0 20 0z"
            fill="${color}" />
      <!-- White circle bg for icon -->
      <circle cx="20" cy="18" r="10" fill="rgba(255,255,255,0.22)" />
      <!-- Person icon (SVG path) -->
      <g transform="translate(20,18)" fill="white">
        <!-- Head -->
        <circle cx="0" cy="-4" r="3" />
        <!-- Body -->
        <path d="M-4 2 Q-4 8 0 8 Q4 8 4 2 Q2 -1 0 -1 Q-2 -1 -4 2Z" />
      </g>
    </svg>`

  return divIcon({
    html: svg,
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
  })
}

export function BathroomPin({ bathroom, onClick, selected = false }: BathroomPinProps) {
  const color = pinColor(bathroom.avg_rating, bathroom.status)
  const icon  = createPinIcon(color, selected)

  return (
    <Marker
      position={[bathroom.lat, bathroom.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick?.(bathroom) }}
      zIndexOffset={selected ? 1000 : 0}
    />
  )
}
