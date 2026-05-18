import { MapPin, Clock, Star } from 'lucide-react'
import { AttributeChips } from './AttributeChips'
import { PhotoGallery } from './PhotoGallery'
import { ReportButton } from './ReportButton'
import { AdBanner } from '@/components/ads/AdBanner'
import { Button } from '@/components/ui/Button'
import { formatDistance } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BathroomDetail as BathroomDetailType } from '@to-apertado/types'

interface BathroomDetailProps {
  bathroom: BathroomDetailType
  onRate: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-text-muted dark:text-gray-500">
      {children}
    </p>
  )
}

export function BathroomDetail({ bathroom, onRate }: BathroomDetailProps) {
  const avgRating = bathroom.avg_rating ?? 0

  return (
    <div className="px-5 pb-28 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-gray-50 leading-snug">
          {bathroom.name}
        </h2>

        {/* Star rating row */}
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                size={15}
                strokeWidth={1.5}
                className={cn(
                  i <= Math.round(avgRating)
                    ? 'fill-warning text-warning'
                    : 'fill-transparent text-gray-300 dark:text-gray-600',
                )}
              />
            ))}
          </div>
          {avgRating > 0 && (
            <span className="text-sm font-bold text-text-primary dark:text-gray-200">
              {avgRating.toFixed(1)}
            </span>
          )}
          <span className="text-xs text-text-muted">
            {bathroom.total_ratings > 0
              ? `${bathroom.total_ratings} avaliações`
              : 'Sem avaliações'}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          {bathroom.distance_meters != null && (
            <span className="flex items-center gap-1">
              <MapPin size={11} strokeWidth={2.5} />
              {formatDistance(bathroom.distance_meters)}
            </span>
          )}
          {bathroom.address && (
            <span className="truncate max-w-[200px]">{bathroom.address}</span>
          )}
          {bathroom.opening_hours?.raw && (
            <span className="flex items-center gap-1">
              <Clock size={11} strokeWidth={2.5} />
              {bathroom.opening_hours.raw}
            </span>
          )}
        </div>
      </div>

      {/* Attributes */}
      <div>
        <SectionLabel>Características</SectionLabel>
        <AttributeChips attrs={bathroom} />
      </div>

      {/* Photos */}
      {bathroom.photos.length > 0 && (
        <div>
          <SectionLabel>Fotos ({bathroom.photos.length})</SectionLabel>
          <PhotoGallery photos={bathroom.photos} />
        </div>
      )}

      {/* Ad banner */}
      <AdBanner />

      {/* Recent ratings */}
      <div>
        <SectionLabel>Avaliações recentes</SectionLabel>

        {bathroom.recent_ratings.length > 0 ? (
          <ul className="space-y-2.5">
            {bathroom.recent_ratings.map(r => (
              <li
                key={r.id}
                className="rounded-2xl bg-surface-2 p-4 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star
                        key={i}
                        size={12}
                        strokeWidth={1.5}
                        className={cn(
                          i <= r.overall
                            ? 'fill-warning text-warning'
                            : 'fill-transparent text-gray-300 dark:text-gray-600',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(r.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm leading-relaxed text-text-primary dark:text-gray-300">
                    {r.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-2 py-8 text-center dark:bg-gray-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Star size={22} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary dark:text-gray-200">
                Nenhuma avaliação ainda
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                Seja o primeiro a ajudar quem precisar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <ReportButton bathroomId={bathroom.id} />
        <Button onClick={onRate} size="lg" className="flex-1 ml-3">
          Avaliar este banheiro
        </Button>
      </div>
    </div>
  )
}
