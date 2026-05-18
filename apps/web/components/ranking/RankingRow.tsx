import { Avatar } from '@/components/ui/Avatar'
import type { RankingEntry } from '@/hooks/useRanking'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface RankingRowProps {
  entry: RankingEntry
  position: number
}

export function RankingRow({ entry, position }: RankingRowProps) {
  const medal = MEDALS[position]

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
      <div className="w-7 shrink-0 text-center">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-semibold text-gray-400">{position}</span>
        )}
      </div>

      <Avatar
        src={entry.avatar_url}
        name={entry.name ?? '?'}
        size="sm"
      />

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
        {entry.name ?? 'Anônimo'}
      </p>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          {entry.total_points.toLocaleString('pt-BR')}
        </p>
        <p className="text-[10px] text-gray-400">pts</p>
      </div>
    </div>
  )
}
