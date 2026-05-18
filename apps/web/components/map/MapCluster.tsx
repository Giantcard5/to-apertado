import MarkerClusterGroup from 'react-leaflet-cluster'
import type { BathroomPin } from '@to-apertado/types'
import { BathroomPin as BathroomPinComponent } from './BathroomPin'

interface MapClusterProps {
  bathrooms: BathroomPin[]
  onPinClick?: (bathroom: BathroomPin) => void
}

export function MapCluster({ bathrooms, onPinClick }: MapClusterProps) {
  return (
    <MarkerClusterGroup chunkedLoading>
      {bathrooms.map(b => (
        <BathroomPinComponent key={b.id} bathroom={b} onClick={onPinClick} />
      ))}
    </MarkerClusterGroup>
  )
}
