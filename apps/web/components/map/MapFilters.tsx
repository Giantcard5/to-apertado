'use client'

import { Chip } from '@/components/ui/Chip'

export interface MapFilterState {
  free?: boolean
  accessible?: boolean
  type?: string
}

interface MapFiltersProps {
  filters: MapFilterState
  onChange: (filters: MapFilterState) => void
}

const TYPE_OPTIONS = [
  { label: 'Shopping',    value: 'shopping' },
  { label: 'Restaurante', value: 'restaurante' },
  { label: 'Público',     value: 'publico' },
  { label: 'Posto',       value: 'posto' },
]

export function MapFilters({ filters, onChange }: MapFiltersProps) {
  const toggle = (key: keyof MapFilterState, value: boolean | string | undefined) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
      <Chip
        label="Gratuito"
        selected={filters.free === true}
        onClick={() => toggle('free', true)}
      />
      <Chip
        label="Acessível"
        selected={filters.accessible === true}
        onClick={() => toggle('accessible', true)}
      />
      {TYPE_OPTIONS.map(({ label, value }) => (
        <Chip
          key={value}
          label={label}
          selected={filters.type === value}
          onClick={() => toggle('type', value)}
        />
      ))}
    </div>
  )
}
