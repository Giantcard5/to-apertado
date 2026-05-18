'use client'

import { cn } from '@/lib/utils'

const PLACE_TYPES = [
  { value: 'public',     label: 'Público',     icon: '🏛️' },
  { value: 'shopping',   label: 'Shopping',    icon: '🛍️' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { value: 'gas_station',label: 'Posto',       icon: '⛽' },
  { value: 'other',      label: 'Outro',       icon: '📍' },
]

interface Step2NameTypeProps {
  name: string
  placeType: string
  onNameChange: (v: string) => void
  onTypeChange: (v: string) => void
}

export function Step2NameType({
  name,
  placeType,
  onNameChange,
  onTypeChange,
}: Step2NameTypeProps) {
  return (
    <div className="space-y-5 py-2">
      <div>
        <label
          htmlFor="bathroom-name"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Nome do local
        </label>
        <input
          id="bathroom-name"
          type="text"
          maxLength={255}
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Ex: Shopping Ibirapuera — piso 2"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de local</p>
        <div className="grid grid-cols-3 gap-2">
          {PLACE_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => onTypeChange(placeType === t.value ? '' : t.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-medium transition-colors',
                placeType === t.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
