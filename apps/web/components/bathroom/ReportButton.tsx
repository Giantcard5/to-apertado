'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { apiFetch } from '@/lib/api'

const REASONS = [
  { value: 'closed', label: 'Banheiro fechado ou inexistente' },
  { value: 'wrong_info', label: 'Informações incorretas' },
  { value: 'inappropriate_photo', label: 'Foto inapropriada' },
  { value: 'spam', label: 'Spam ou conteúdo enganoso' },
  { value: 'other', label: 'Outro motivo' },
]

interface ReportButtonProps {
  bathroomId: string
}

export function ReportButton({ bathroomId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await apiFetch(`/bathrooms/${bathroomId}/reports`, {
        method: 'POST',
        body: JSON.stringify({ reason: selected }),
      })
      toast.success('Reporte enviado. Obrigado!')
      setOpen(false)
      setSelected(null)
    } catch {
      toast.error('Erro ao enviar reporte. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag size={12} />
        Reportar problema
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} snapPoints={[0.6]}>
        <div className="px-4 pb-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-50">
            Qual é o problema?
          </h3>
          <ul className="space-y-2">
            {REASONS.map(r => (
              <li key={r.value}>
                <button
                  onClick={() => setSelected(r.value)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                    selected === r.value
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="danger"
            className="mt-4 w-full"
            disabled={!selected || loading}
            onClick={submit}
          >
            {loading ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
