import { MapPin, ChevronUp } from 'lucide-react'
import { RatingStars } from './RatingStars'
import { Button } from '@/components/ui/Button'
import { formatDistance } from '@/lib/utils'
import type { BathroomDetail } from '@to-apertado/types'

interface BathroomCardProps {
  bathroom: BathroomDetail
  onExpand: () => void
  onRate: () => void
}

export function BathroomCard({ bathroom, onExpand, onRate }: BathroomCardProps) {
  return (
    <div className="px-4 pb-4">
      {/* Tap to expand hint */}
      <button
        onClick={onExpand}
        className="mb-3 flex w-full items-start justify-between gap-2 text-left"
        aria-label="Ver detalhes completos"
      >
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-gray-900 dark:text-gray-50">
            {bathroom.name}
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <RatingStars rating={bathroom.avg_rating} size={14} />
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {bathroom.total_ratings} avaliações
            </span>
          </div>
        </div>
        <ChevronUp size={20} className="mt-0.5 shrink-0 text-gray-400" />
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {bathroom.distance_meters != null && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} />
              {formatDistance(bathroom.distance_meters)}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              bathroom.is_free
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {bathroom.is_free ? 'Gratuito' : 'Pago'}
          </span>
        </div>

        <Button size="sm" onClick={onRate}>
          Avaliar
        </Button>
      </div>
    </div>
  )
}
