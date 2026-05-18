'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number      // 0–100
  label?: string
  className?: string
  barClassName?: string
}

export function ProgressBar({ value, label, className, barClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          className={cn('h-full rounded-full bg-blue-600', barClassName)}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
