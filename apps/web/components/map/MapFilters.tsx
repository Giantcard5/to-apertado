'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold',
        'min-h-[36px] transition-colors duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-1',
        active
          ? 'bg-primary text-white shadow-primary-sm'
          : 'bg-white/90 text-text-primary shadow-card hover:bg-white dark:bg-gray-800/90 dark:text-gray-100 dark:hover:bg-gray-800',
      )}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 25 }}
          >
            <Check size={13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  )
}

const hasActiveFilters = (f: MapFilterState) =>
  f.free || f.accessible || !!f.type

export function MapFilters({ filters, onChange }: MapFiltersProps) {
  const toggle = (key: keyof MapFilterState, value: boolean | string | undefined) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value })
  }

  const clearAll = () => onChange({})

  return (
    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      <FilterChip
        label="Gratuito"
        active={filters.free === true}
        onClick={() => toggle('free', true)}
      />
      <FilterChip
        label="Acessível"
        active={filters.accessible === true}
        onClick={() => toggle('accessible', true)}
      />

      {/* Vertical divider */}
      <div className="h-5 w-px flex-shrink-0 rounded-full bg-gray-300/60 dark:bg-gray-600/60" />

      {TYPE_OPTIONS.map(({ label, value }) => (
        <FilterChip
          key={value}
          label={label}
          active={filters.type === value}
          onClick={() => toggle('type', value)}
        />
      ))}

      {/* Clear all — appears when any filter is active */}
      <AnimatePresence>
        {hasActiveFilters(filters) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            type="button"
            onClick={clearAll}
            className="flex-shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold text-text-muted hover:text-error transition-colors whitespace-nowrap min-h-[36px] outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            Limpar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
