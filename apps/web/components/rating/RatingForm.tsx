'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { Step1Stars } from './Step1Stars'
import { Step2Attributes } from './Step2Attributes'
import { Step3PhotoComment } from './Step3PhotoComment'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api'

const TOTAL_STEPS = 3

const STEP_TITLES = ['Qual a nota geral?', 'Como estava o banheiro?', 'Foto e comentário']

interface Attrs {
  cleanliness?: 1 | 2 | 3
  has_paper?: boolean
  has_soap?: boolean
  has_dryer?: boolean
  smell?: 1 | 2 | 3
}

interface RatingFormProps {
  bathroomId: string
  bathroomName: string
}

interface PresignResponse {
  uploadUrl: string
  key: string
}

interface RatingResponse {
  data: { id: string }
}

async function uploadPhoto(bathroomId: string, ratingId: string, file: File) {
  const { uploadUrl, key } = await apiFetch<PresignResponse>('/photos/presign', {
    method: 'POST',
    body: JSON.stringify({ bathroomId, contentType: file.type }),
  })

  await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })

  await apiFetch('/photos/confirm', {
    method: 'POST',
    body: JSON.stringify({ key, bathroomId, ratingId }),
  })
}

export function RatingForm({ bathroomId, bathroomName }: RatingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [overall, setOverall] = useState(0)
  const [attrs, setAttrs] = useState<Attrs>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canNext =
    step === 1 ? overall > 0 :
    step === 2 ? true :
    true

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const goBack = () => {
    if (step > 1) setStep(s => s - 1)
    else router.back()
  }

  const submit = async () => {
    if (overall === 0) return
    setSubmitting(true)

    try {
      const { data } = await apiFetch<RatingResponse>(`/bathrooms/${bathroomId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({
          overall,
          ...attrs,
          comment: comment.trim() || undefined,
        }),
      })

      const ratingId = data.id

      for (const file of photos) {
        try {
          await uploadPhoto(bathroomId, ratingId, file)
        } catch {
          // Photo upload failure is non-fatal — rating already saved
          toast.warning('Avaliação salva, mas uma foto não pôde ser enviada.')
        }
      }

      toast.success('Missão cumprida. Você ajudou quem realmente precisava.')
      router.replace('/')
    } catch {
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="px-4 pb-2 pt-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{bathroomName}</p>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              {STEP_TITLES[step - 1]}
            </h1>
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
        <ProgressBar value={(step / TOTAL_STEPS) * 100} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >
            {step === 1 && <Step1Stars value={overall} onChange={setOverall} />}
            {step === 2 && <Step2Attributes value={attrs} onChange={setAttrs} />}
            {step === 3 && (
              <Step3PhotoComment
                photos={photos}
                comment={comment}
                onPhotosChange={setPhotos}
                onCommentChange={setComment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 px-4 pb-6 pt-3 dark:border-gray-800">
        {step < TOTAL_STEPS ? (
          <Button
            className="w-full"
            disabled={!canNext}
            onClick={goNext}
          >
            Continuar
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={submitting || overall === 0}
            onClick={submit}
          >
            {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </Button>
        )}
      </div>
    </div>
  )
}
