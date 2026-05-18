'use client'

import { cn } from '@/lib/utils'

interface Attrs {
  cleanliness?: 1 | 2 | 3
  has_paper?: boolean
  has_soap?: boolean
  has_dryer?: boolean
  smell?: 1 | 2 | 3
}

interface Step2AttributesProps {
  value: Attrs
  onChange: (v: Attrs) => void
}

function ToggleGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; icon: string }[]
  value: T | undefined
  onChange: (v: T | undefined) => void
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(value === opt.value ? undefined : opt.value)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors',
              value === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            )}
          >
            <span className="mr-1">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BooleanToggle({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: string
  value: boolean | undefined
  onChange: (v: boolean | undefined) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        <span className="mr-1.5">{icon}</span>
        {label}
      </span>
      <div className="flex gap-1.5">
        {([true, false] as const).map(bool => (
          <button
            key={String(bool)}
            onClick={() => onChange(value === bool ? undefined : bool)}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
              value === bool
                ? bool
                  ? 'bg-green-600 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400',
            )}
          >
            {bool ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Step2Attributes({ value, onChange }: Step2AttributesProps) {
  const set = <K extends keyof Attrs>(k: K, v: Attrs[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="space-y-5 py-2">
      <ToggleGroup
        label="Limpeza"
        options={[
          { value: 3 as const, label: 'Limpo', icon: '✨' },
          { value: 2 as const, label: 'Aceitável', icon: '😐' },
          { value: 1 as const, label: 'Sujo', icon: '🤢' },
        ]}
        value={value.cleanliness}
        onChange={v => set('cleanliness', v as 1 | 2 | 3 | undefined)}
      />

      <ToggleGroup
        label="Cheiro"
        options={[
          { value: 3 as const, label: 'Sem cheiro', icon: '😊' },
          { value: 2 as const, label: 'Leve', icon: '😶' },
          { value: 1 as const, label: 'Mal cheiro', icon: '🤮' },
        ]}
        value={value.smell}
        onChange={v => set('smell', v as 1 | 2 | 3 | undefined)}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tem no banheiro?</p>
        <BooleanToggle
          label="Papel higiênico"
          icon="🧻"
          value={value.has_paper}
          onChange={v => set('has_paper', v)}
        />
        <BooleanToggle
          label="Sabão / sabonete"
          icon="🫧"
          value={value.has_soap}
          onChange={v => set('has_soap', v)}
        />
        <BooleanToggle
          label="Secador de mãos"
          icon="💨"
          value={value.has_dryer}
          onChange={v => set('has_dryer', v)}
        />
      </div>
    </div>
  )
}
