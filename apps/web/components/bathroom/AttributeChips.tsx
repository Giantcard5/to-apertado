import { cn } from '@/lib/utils'
import type { BathroomDetail } from '@to-apertado/types'

type Attributes = Pick<
  BathroomDetail,
  'is_free' | 'is_accessible' | 'requires_key'
> & {
  has_paper?: boolean | null
  has_soap?: boolean | null
  has_dryer?: boolean | null
  cleanliness?: number | null
  smell?: number | null
}

interface AttributeChipsProps {
  attrs: Attributes
  className?: string
}

interface Chip {
  label: string
  icon: string
  active: boolean
  positive: boolean
}

function cleanlinessLabel(v: number | null | undefined): string | null {
  if (v === 3) return 'Limpo'
  if (v === 2) return 'Aceitável'
  if (v === 1) return 'Sujo'
  return null
}

function smellLabel(v: number | null | undefined): string | null {
  if (v === 3) return 'Sem cheiro'
  if (v === 2) return 'Cheiro leve'
  if (v === 1) return 'Mal cheiroso'
  return null
}

export function AttributeChips({ attrs, className }: AttributeChipsProps) {
  const chips: Chip[] = [
    { label: 'Gratuito',    icon: '💰', active: attrs.is_free,       positive: attrs.is_free },
    { label: 'Acessível',   icon: '♿', active: attrs.is_accessible,  positive: attrs.is_accessible },
    { label: 'Com chave',   icon: '🔑', active: attrs.requires_key,   positive: false },
    { label: 'Tem papel',   icon: '🧻', active: !!attrs.has_paper,    positive: true },
    { label: 'Tem sabão',   icon: '🫧', active: !!attrs.has_soap,     positive: true },
    { label: 'Tem secador', icon: '💨', active: !!attrs.has_dryer,    positive: true },
  ].filter(c => c.active)

  const cleanLabel = cleanlinessLabel(attrs.cleanliness)
  const smellLbl   = smellLabel(attrs.smell)

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map(chip => (
        <span
          key={chip.label}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
            chip.positive
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
          )}
        >
          <span>{chip.icon}</span> {chip.label}
        </span>
      ))}
      {cleanLabel && (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
          attrs.cleanliness === 3
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : attrs.cleanliness === 2
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        )}>
          🧴 {cleanLabel}
        </span>
      )}
      {smellLbl && (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
          attrs.smell === 3
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : attrs.smell === 2
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        )}>
          💨 {smellLbl}
        </span>
      )}
    </div>
  )
}
