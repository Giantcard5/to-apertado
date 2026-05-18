import { MapPin, ChevronUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDistance } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BathroomDetail } from '@to-apertado/types'

interface BathroomCardProps {
  bathroom: BathroomDetail
  onExpand: () => void
  onRate: () => void
}

const PLACE_TYPE_LABELS: Record<string, string> = {
  shopping:    'Shopping',
  restaurante: 'Restaurante',
  publico:     'Público',
  posto:       'Posto',
  outro:       'Outro',
}

export function BathroomCard({ bathroom, onExpand, onRate }: BathroomCardProps) {
  const avgRating = bathroom.avg_rating ?? 0

  return (
    <div className="px-5 pt-4 pb-5">
      {/* Header — tap to expand */}
      <button
        onClick={onExpand}
        className="mb-4 flex w-full items-start justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-label="Ver detalhes completos"
      >
        <div className="min-w-0 flex-1">
          {/* Place type badge */}
          {bathroom.place_type && (
            <span className="mb-1 inline-block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {PLACE_TYPE_LABELS[bathroom.place_type] ?? bathroom.place_type}
            </span>
          )}

          <h2 className="truncate text-lg font-bold text-text-primary dark:text-gray-50 leading-tight">
            {bathroom.name}
          </h2>

          {/* Rating row */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  size={13}
                  className={cn(
                    i <= Math.round(avgRating)
                      ? 'fill-warning text-warning'
                      : 'fill-transparent text-gray-300 dark:text-gray-600',
                  )}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            {avgRating > 0 && (
              <span className="text-xs font-semibold text-text-primary dark:text-gray-200">
                {avgRating.toFixed(1)}
              </span>
            )}
            <span className="text-xs text-text-muted">
              {bathroom.total_ratings > 0
                ? `${bathroom.total_ratings} avaliações`
                : 'Sem avaliações'}
            </span>
          </div>
        </div>

        <ChevronUp
          size={18}
          strokeWidth={2.5}
          className="mt-1 shrink-0 text-text-muted"
        />
      </button>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Distance pill */}
          {bathroom.distance_meters != null && (
            <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-muted dark:bg-gray-800 dark:text-gray-400">
              <MapPin size={11} strokeWidth={2.5} />
              {formatDistance(bathroom.distance_meters)}
            </span>
          )}

          {/* Free/Paid badge */}
          <span className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            bathroom.is_free
              ? 'bg-success/10 text-success dark:bg-success/20'
              : 'bg-surface-3 text-text-muted dark:bg-gray-800 dark:text-gray-400',
          )}>
            {bathroom.is_free ? 'Gratuito' : 'Pago'}
          </span>
        </div>

        <Button size="sm" onClick={onRate} className="rounded-xl">
          Avaliar
        </Button>
      </div>
    </div>
  )
}
