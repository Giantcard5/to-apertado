import { cn } from '@/lib/utils'

const TABS = [
  { value: 'week'  as const, label: 'Semana' },
  { value: 'month' as const, label: 'Mês' },
  { value: 'all'   as const, label: 'Geral' },
]

interface PeriodTabsProps {
  value: 'week' | 'month' | 'all'
  onChange: (v: 'week' | 'month' | 'all') => void
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-50'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
