'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light',  icon: Sun,     label: 'Claro' },
  { value: 'dark',   icon: Moon,    label: 'Escuro' },
  { value: 'system', icon: Monitor, label: 'Sistema' },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={cn('inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 gap-1', className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 min-h-[36px] text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none',
            theme === value
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
          )}
        >
          <Icon size={15} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
