'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Photo } from '@to-apertado/types'

interface PhotoGalleryProps {
  photos: Photo[]
  className?: string
}

export function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  const approved = photos.filter(p => p.status === 'approved')
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (approved.length === 0) return null

  return (
    <>
      <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
        {approved.map(photo => (
          <button
            key={photo.id}
            onClick={() => setLightbox(photo.url)}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Image
              src={photo.url}
              alt="Foto do banheiro"
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
          <div className="relative h-[80vw] max-h-[80vh] w-[80vw] max-w-[80vh]">
            <Image
              src={lightbox}
              alt="Foto do banheiro"
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
