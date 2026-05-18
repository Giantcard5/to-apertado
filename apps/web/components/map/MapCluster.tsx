import MarkerClusterGroup from 'react-leaflet-cluster'
import type { BathroomPin } from '@to-apertado/types'
import { BathroomPin as BathroomPinComponent } from './BathroomPin'
import { divIcon } from 'leaflet'

interface MapClusterProps {
  bathrooms: BathroomPin[]
  onPinClick?: (bathroom: BathroomPin) => void
  selectedId?: string | null
}

function createClusterIcon(count: number) {
  const size = count < 10 ? 36 : count < 100 ? 42 : 50
  const fontSize = count < 10 ? 13 : count < 100 ? 12 : 11

  return divIcon({
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        background:#1A6BFF;
        border:2.5px solid white;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:${fontSize}px;
        font-weight:700;
        font-family:system-ui,sans-serif;
        box-shadow:0 2px 8px rgba(26,107,255,0.35);
        letter-spacing:-0.3px;
      ">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function MapCluster({ bathrooms, onPinClick, selectedId }: MapClusterProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={(cluster) => createClusterIcon(cluster.getChildCount())}
    >
      {bathrooms.map(b => (
        <BathroomPinComponent
          key={b.id}
          bathroom={b}
          onClick={onPinClick}
          selected={b.id === selectedId}
        />
      ))}
    </MarkerClusterGroup>
  )
}
