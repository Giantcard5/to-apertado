'use client'

interface ToggleRowProps {
  icon: string
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}

interface Step3DetailsProps {
  isFree: boolean
  isAccessible: boolean
  requiresKey: boolean
  openingHours: string
  onIsFreeChange: (v: boolean) => void
  onIsAccessibleChange: (v: boolean) => void
  onRequiresKeyChange: (v: boolean) => void
  onOpeningHoursChange: (v: string) => void
}

export function Step3Details({
  isFree,
  isAccessible,
  requiresKey,
  openingHours,
  onIsFreeChange,
  onIsAccessibleChange,
  onRequiresKeyChange,
  onOpeningHoursChange,
}: Step3DetailsProps) {
  return (
    <div className="space-y-4 py-2">
      <ToggleRow
        icon="💰"
        label="Gratuito"
        description="Não cobra para usar"
        value={isFree}
        onChange={onIsFreeChange}
      />
      <ToggleRow
        icon="♿"
        label="Acessível"
        description="Adaptado para cadeirantes"
        value={isAccessible}
        onChange={onIsAccessibleChange}
      />
      <ToggleRow
        icon="🔑"
        label="Requer chave"
        description="Precisa pedir a chave"
        value={requiresKey}
        onChange={onRequiresKeyChange}
      />

      <div>
        <label
          htmlFor="opening-hours"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Horário de funcionamento{' '}
          <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="opening-hours"
          rows={3}
          value={openingHours}
          onChange={e => onOpeningHoursChange(e.target.value)}
          placeholder="Ex: Seg–Sex 8h–22h, Sáb 9h–20h, Dom fechado"
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>
    </div>
  )
}
