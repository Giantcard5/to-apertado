import { RankingTable } from '@/components/ranking/RankingTable'

export const metadata = {
  title: 'Ranking — Tô Apertado',
}

export default function RankingPage() {
  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="mb-5 text-xl font-semibold text-gray-900 dark:text-gray-50">
        🏆 Ranking
      </h1>
      <RankingTable />
    </div>
  )
}
