import { cn } from '@/lib/utils'

export interface BadgeDef {
  slug: string
  name: string
  description: string
  icon: string
}

interface BadgeCardProps {
  badge: BadgeDef
  awardedAt?: string | null
}

export function BadgeCard({ badge, awardedAt }: BadgeCardProps) {
  const earned = !!awardedAt

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-all',
        earned
          ? 'bg-white shadow-sm ring-1 ring-blue-100 dark:bg-gray-800 dark:ring-blue-900/40'
          : 'bg-gray-50 dark:bg-gray-800/50',
      )}
    >
      <span
        className={cn(
          'text-3xl',
          !earned && 'grayscale opacity-30',
        )}
      >
        {badge.icon}
      </span>
      <p
        className={cn(
          'text-xs font-semibold leading-tight',
          earned
            ? 'text-gray-800 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-600',
        )}
      >
        {badge.name}
      </p>
      {earned && awardedAt ? (
        <p className="text-[10px] text-gray-400">
          {new Date(awardedAt).toLocaleDateString('pt-BR')}
        </p>
      ) : (
        <p className="text-[10px] text-gray-300 dark:text-gray-600">
          {badge.description}
        </p>
      )}
    </div>
  )
}
