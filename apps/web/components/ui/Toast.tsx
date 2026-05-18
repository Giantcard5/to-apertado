'use client'

import { Toaster } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

export function ToastProvider() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme}
      position="bottom-center"
      offset={72}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
    />
  )
}

export { toast } from 'sonner'
