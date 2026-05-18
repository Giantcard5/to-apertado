'use client'

import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BathroomCard } from './BathroomCard'
import { BathroomDetail } from './BathroomDetail'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBathroomDetail } from '@/hooks/useBathroomDetail'
import { useAuth } from '@/contexts/AuthContext'
import type { BathroomPin } from '@to-apertado/types'

const PEEK_HEIGHT = '32vh'
const FULL_HEIGHT = '90vh'

interface BathroomSheetProps {
  bathroom: BathroomPin | null
  onClose: () => void
}

export function BathroomSheet({ bathroom, onClose }: BathroomSheetProps) {
  const [stage, setStage] = useState<1 | 2>(1)
  const dragControls = useDragControls()
  const router = useRouter()
  const { requireAuth } = useAuth()

  const { data: detail, isLoading } = useBathroomDetail(
    stage === 2 ? bathroom?.id ?? null : null,
  )

  // Reset to peek when a new bathroom is selected
  useEffect(() => {
    if (bathroom) setStage(1)
  }, [bathroom?.id])

  // Close on Escape
  useEffect(() => {
    if (!bathroom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stage === 2) setStage(1)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bathroom, stage, onClose])

  const startDrag = useCallback(
    (e: React.PointerEvent) => dragControls.start(e),
    [dragControls],
  )

  const handleExpand = () => setStage(2)

  const handleRate = () => {
    if (!bathroom) return
    if (!requireAuth('avaliar')) return
    router.push(`/avaliar/${bathroom.id}`)
  }

  const handleDragEnd = (_: unknown, info: { velocity: { y: number }; offset: { y: number } }) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      if (stage === 2) setStage(1)
      else onClose()
    } else if (info.velocity.y < -300 || info.offset.y < -100) {
      if (stage === 1) setStage(2)
    }
  }

  return (
    <AnimatePresence>
      {bathroom && (
        <motion.div
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.2 }}
          onDragEnd={handleDragEnd}
          animate={{ height: stage === 2 ? FULL_HEIGHT : PEEK_HEIGHT }}
          initial={{ height: PEEK_HEIGHT, y: '100%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[500] flex flex-col rounded-t-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        >
          {/* Drag handle */}
          <div
            className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-1 pt-3 active:cursor-grabbing"
            onPointerDown={startDrag}
            onClick={() => stage === 1 && setStage(2)}
          >
            <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {stage === 1 && (
              <BathroomCard
                bathroom={{ ...bathroom, address: null, requires_key: false, opening_hours: null, source: 'osm', recent_ratings: [], photos: [] }}
                onExpand={handleExpand}
                onRate={handleRate}
              />
            )}

            {stage === 2 && (
              <>
                {isLoading || !detail ? (
                  <div className="space-y-3 px-4 py-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <BathroomDetail bathroom={detail} onRate={handleRate} />
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
