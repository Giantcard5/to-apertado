import { MapPin, Clock } from 'lucide-react'
import { RatingStars } from './RatingStars'
import { AttributeChips } from './AttributeChips'
import { PhotoGallery } from './PhotoGallery'
import { ReportButton } from './ReportButton'
import { AdBanner } from '@/components/ads/AdBanner'
import { Button } from '@/components/ui/Button'
import { formatDistance } from '@/lib/utils'
import type { BathroomDetail as BathroomDetailType } from '@to-apertado/types'

interface BathroomDetailProps {
  bathroom: BathroomDetailType
  onRate: () => void
}

export function BathroomDetail({ bathroom, onRate }: BathroomDetailProps) {
  return (
    <div className="px-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{bathroom.name}</h2>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <RatingStars rating={bathroom.avg_rating} size={16} />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {bathroom.total_ratings} avaliações
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {bathroom.distance_meters != null && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {formatDistance(bathroom.distance_meters)}
            </span>
          )}
          {bathroom.address && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="opacity-0" />
              {bathroom.address}
            </span>
          )}
          {bathroom.opening_hours?.raw && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {bathroom.opening_hours.raw}
            </span>
          )}
        </div>
      </div>

      {/* Attribute chips */}
      <AttributeChips
        attrs={bathroom}
        className="mb-4"
      />

      {/* Photos */}
      {bathroom.photos.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Fotos</h3>
          <PhotoGallery photos={bathroom.photos} />
        </div>
      )}

      {/* Ad banner (between photos and ratings) */}
      <AdBanner />

      {/* Recent ratings */}
      {bathroom.recent_ratings.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Avaliações recentes
          </h3>
          <ul className="space-y-3">
            {bathroom.recent_ratings.map(r => (
              <li
                key={r.id}
                className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <RatingStars rating={r.overall} size={13} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bathroom.recent_ratings.length === 0 && (
        <p className="mb-4 text-sm text-gray-400 italic">Nenhuma avaliação ainda. Seja o primeiro!</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <ReportButton bathroomId={bathroom.id} />
        <Button onClick={onRate}>Avaliar este banheiro</Button>
      </div>
    </div>
  )
}
