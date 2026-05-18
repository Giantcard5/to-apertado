'use client'

import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Snap points as a fraction of viewport height, e.g. [0.3, 0.9] */
  snapPoints?: number[]
  /** Index in snapPoints to start at */
  initialSnap?: number
  children: React.ReactNode
  className?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  snapPoints = [0.9],
  initialSnap = 0,
  children,
  className,
}: BottomSheetProps) {
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

  const snapHeights = snapPoints.map(p => `${p * 100}vh`)
  const initialHeight = snapHeights[initialSnap] ?? snapHeights[0]

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const startDrag = useCallback(
    (e: React.PointerEvent) => dragControls.start(e),
    [dragControls],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 400 || info.offset.y > 150) onClose()
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ height: initialHeight }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden',
              className,
            )}
          >
            {/* Drag handle */}
            <div
              className="flex shrink-0 cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
              onPointerDown={startDrag}
            >
              <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
