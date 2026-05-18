'use client'

import { usePathname } from 'next/navigation'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { GoogleSignInButton } from './GoogleSignInButton'
import { useAuth } from '@/contexts/AuthContext'

const ACTION_TITLES: Record<string, string> = {
  avaliar: 'Entre para avaliar',
  cadastrar: 'Entre para cadastrar',
  perfil: 'Entre para ver seu perfil',
}

export function LoginSheet() {
  const { loginSheetOpen, loginSheetAction, closeLoginSheet } = useAuth()
  const pathname = usePathname()

  const title = ACTION_TITLES[loginSheetAction] ?? 'Entre para continuar'

  return (
    <BottomSheet isOpen={loginSheetOpen} onClose={closeLoginSheet} snapPoints={[0.45]}>
      <div className="px-6 pb-8 pt-2">
        <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Sem senha. Só o Google.
        </p>

        <GoogleSignInButton returnTo={pathname} />

        <p className="mt-4 text-center text-xs text-gray-400">
          Ao entrar você concorda com os nossos{' '}
          <span className="underline cursor-pointer">termos de uso</span>.
        </p>
      </div>
    </BottomSheet>
  )
}
