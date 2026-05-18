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
        'inline-flex items-center justify-center rounded-full px-4 min-h-[36px] text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none',
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        className,
      )}
    >
      {label}
    </button>
  )
}
