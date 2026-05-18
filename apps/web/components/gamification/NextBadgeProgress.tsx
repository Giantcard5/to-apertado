import { ProgressBar } from '@/components/ui/ProgressBar'

// Points thresholds for milestones based on gamification rules
const MILESTONES = [
  { points: 10,   label: 'Primeira avaliação (+10 pts)' },
  { points: 50,   label: 'Cadastrar banheiro (+50 pts)' },
  { points: 100,  label: 'Explorador: 10 avaliações' },
  { points: 500,  label: 'Explorador Pro: 50 avaliações' },
  { points: 1000, label: 'Crítico: 100 avaliações' },
]

interface NextBadgeProgressProps {
  points: number
}

export function NextBadgeProgress({ points }: NextBadgeProgressProps) {
  const next = MILESTONES.find(m => m.points > points)
  const prev = MILESTONES.filter(m => m.points <= points).at(-1)

  if (!next) {
    return (
      <div className="rounded-2xl bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
          🏆 Você alcançou o nível máximo!
        </p>
      </div>
    )
  }

  const from = prev?.points ?? 0
  const progress = Math.round(((points - from) / (next.points - from)) * 100)

  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Próxima conquista
        </p>
        <p className="text-xs text-gray-400">
          {points} / {next.points} pts
        </p>
      </div>
      <ProgressBar value={progress} className="mb-1.5" />
      <p className="text-xs text-gray-500 dark:text-gray-400">{next.label}</p>
    </div>
  )
}
