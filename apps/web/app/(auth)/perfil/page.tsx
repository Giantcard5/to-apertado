'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PointsDisplay } from '@/components/gamification/PointsDisplay'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { NextBadgeProgress } from '@/components/gamification/NextBadgeProgress'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { useAuth } from '@/contexts/AuthContext'
import { useUser } from '@/hooks/useUser'

export default function PerfilPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { data: user, isLoading: userLoading } = useUser()
  const router = useRouter()

  const isLoading = authLoading || userLoading

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <p className="mb-2 text-4xl">👤</p>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Sua conta
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Entre para ver seu perfil e conquistas.
          </p>
          <GoogleSignInButton returnTo="/perfil" />
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/')
  }

  return (
    <div className="px-4 pb-8 pt-6">
      {/* User header */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar src={user.avatar_url} name={user.name ?? '?'} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-50">
            {user.name ?? 'Usuário'}
          </h1>
          {user.role === 'admin' && (
            <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <PointsDisplay points={user.points} />
      </div>

      {/* Next badge progress */}
      <div className="mb-6">
        <NextBadgeProgress points={user.points} />
      </div>

      {/* Badges */}
      <div className="mb-6">
        <BadgeGrid earnedBadges={user.badges} />
      </div>

      {/* Ranking shortcut */}
      <button
        onClick={() => router.push('/ranking')}
        className="mb-6 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-amber-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ver ranking
          </span>
        </div>
        <span className="text-gray-400">›</span>
      </button>

      {/* Settings */}
      <div className="mb-6 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Logout */}
      <Button variant="ghost" className="w-full text-red-500" onClick={handleLogout}>
        <LogOut size={16} className="mr-2" />
        Sair da conta
      </Button>
    </div>
  )
}
