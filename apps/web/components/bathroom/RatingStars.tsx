import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number | null
  max?: number
  size?: number
  className?: string
}

export function RatingStars({ rating, max = 5, size = 16, className }: RatingStarsProps) {
  if (rating == null) return <span className="text-sm text-gray-400">Sem avaliações</span>

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating)
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        )
      })}
      <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
