'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { Step1Location } from './Step1Location'
import { Step2NameType } from './Step2NameType'
import { Step3Details } from './Step3Details'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api'

const TOTAL_STEPS = 3
const STEP_TITLES = ['Onde fica?', 'Qual é o local?', 'Detalhes']

interface BathroomResponse {
  data: { id: string }
}

export function RegisterForm() {
  const router = useRouter()

  // Step 1
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  // Step 2
  const [name, setName] = useState('')
  const [placeType, setPlaceType] = useState('')

  // Step 3
  const [isFree, setIsFree] = useState(true)
  const [isAccessible, setIsAccessible] = useState(false)
  const [requiresKey, setRequiresKey] = useState(false)
  const [openingHours, setOpeningHours] = useState('')

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const canNext =
    step === 1 ? lat !== null && lng !== null :
    step === 2 ? name.trim().length > 0 :
    true

  const goBack = () => {
    if (step > 1) setStep(s => s - 1)
    else router.back()
  }

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const submit = async () => {
    if (lat === null || lng === null || !name.trim()) return
    setSubmitting(true)

    try {
      await apiFetch<BathroomResponse>('/bathrooms', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          lat,
          lng,
          place_type:    placeType || undefined,
          is_free:       isFree,
          is_accessible: isAccessible,
          requires_key:  requiresKey,
          opening_hours: openingHours.trim() ? { raw: openingHours.trim() } : undefined,
        }),
      })

      toast.success('Banheiro cadastrado! Obrigado por ajudar o mapa.')
      router.replace('/')
    } catch {
      toast.error('Erro ao cadastrar. Tente novamente.')
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
            {step === 1 && (
              <Step1Location
                lat={lat}
                lng={lng}
                onPick={(la, lo) => { setLat(la); setLng(lo) }}
              />
            )}
            {step === 2 && (
              <Step2NameType
                name={name}
                placeType={placeType}
                onNameChange={setName}
                onTypeChange={setPlaceType}
              />
            )}
            {step === 3 && (
              <Step3Details
                isFree={isFree}
                isAccessible={isAccessible}
                requiresKey={requiresKey}
                openingHours={openingHours}
                onIsFreeChange={setIsFree}
                onIsAccessibleChange={setIsAccessible}
                onRequiresKeyChange={setRequiresKey}
                onOpeningHoursChange={setOpeningHours}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 px-4 pb-6 pt-3 dark:border-gray-800">
        {step < TOTAL_STEPS ? (
          <Button className="w-full" disabled={!canNext} onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={submitting || !canNext}
            onClick={submit}
          >
            {submitting ? 'Cadastrando...' : 'Cadastrar banheiro'}
          </Button>
        )}
      </div>
    </div>
  )
}
