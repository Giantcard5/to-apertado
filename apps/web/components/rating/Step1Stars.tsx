'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const LABELS = ['', 'Péssimo', 'Ruim', 'OK', 'Bom', 'Ótimo']

interface Step1StarsProps {
  value: number
  onChange: (v: number) => void
}

export function Step1Stars({ value, onChange }: Step1StarsProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-base text-gray-500 dark:text-gray-400">
        Como foi sua experiência?
      </p>

      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map(star => (
          <motion.button
            key={star}
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(star)}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-full"
          >
            <motion.div
              animate={
                star <= value
                  ? { scale: [1, 1.3, 1] }
                  : { scale: 1 }
              }
              transition={{ delay: star <= value ? (star - 1) * 0.05 : 0, duration: 0.2 }}
            >
              <Star
                size={40}
                className={
                  star <= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }
              />
            </motion.div>
          </motion.button>
        ))}
      </div>

      <motion.p
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: value > 0 ? 1 : 0, y: 0 }}
        className="text-lg font-semibold text-gray-800 dark:text-gray-200"
      >
        {LABELS[value]}
      </motion.p>
    </div>
  )
}
