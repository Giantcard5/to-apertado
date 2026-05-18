'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Camera, X } from 'lucide-react'

const MAX_PHOTOS = 3
const ACCEPTED = 'image/jpeg,image/png,image/webp'

interface Step3PhotoCommentProps {
  photos: File[]
  comment: string
  onPhotosChange: (files: File[]) => void
  onCommentChange: (v: string) => void
}

export function Step3PhotoComment({
  photos,
  comment,
  onPhotosChange,
  onCommentChange,
}: Step3PhotoCommentProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files).slice(0, MAX_PHOTOS - photos.length)
    onPhotosChange([...photos, ...incoming])
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-5 py-2">
      {/* Photo picker */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Fotos <span className="font-normal text-gray-400">(opcional, até {MAX_PHOTOS})</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {photos.map((file, i) => {
            const url = URL.createObjectURL(file)
            return (
              <div key={i} className="relative h-24 w-24">
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="rounded-xl object-cover"
                  sizes="96px"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  aria-label="Remover foto"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}

          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-gray-600"
            >
              <Camera size={22} />
              <span className="text-xs">Adicionar</span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={e => addPhotos(e.target.files)}
        />
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Comentário <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="comment"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={e => onCommentChange(e.target.value)}
          placeholder="Conte mais sobre o banheiro..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/1000</p>
      </div>
    </div>
  )
}
