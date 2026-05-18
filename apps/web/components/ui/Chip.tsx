import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function Chip({ label, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 min-h-[36px] text-sm font-semibold whitespace-nowrap',
        'transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 outline-none',
        selected
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
          : 'bg-surface-2 text-text-primary hover:bg-surface-3 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
        className,
      )}
    >
      {label}
    </button>
  )
}
