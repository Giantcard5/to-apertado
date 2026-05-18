import { cn } from '@/lib/utils'

const LEVELS = [
  { min: 1000, name: 'Guardião',   color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { min: 500,  name: 'Crítico',    color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { min: 100,  name: 'Explorador', color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-50 dark:bg-green-900/30' },
  { min: 0,    name: 'Curioso',    color: 'text-gray-500 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-800' },
]

function getLevel(points: number) {
  return LEVELS.find(l => points >= l.min) ?? LEVELS[LEVELS.length - 1]
}

interface PointsDisplayProps {
  points: number
  className?: string
}

export function PointsDisplay({ points, className }: PointsDisplayProps) {
  const level = getLevel(points)

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('rounded-full px-4 py-1 text-sm font-medium', level.bg, level.color)}>
        {level.name}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {points.toLocaleString('pt-BR')}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">pontos</span>
      </div>
    </div>
  )
}
