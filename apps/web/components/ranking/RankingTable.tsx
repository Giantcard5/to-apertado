'use client'

import { useState } from 'react'
import { PeriodTabs } from './PeriodTabs'
import { RankingRow } from './RankingRow'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRanking } from '@/hooks/useRanking'

export function RankingTable() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all')
  const { data, isLoading } = useRanking(period)

  return (
    <div className="space-y-4">
      <PeriodTabs value={period} onChange={setPeriod} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Nenhum resultado ainda. Seja o primeiro!
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((entry, i) => (
            <li key={entry.id}>
              <RankingRow entry={entry} position={i + 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
