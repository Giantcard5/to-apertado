'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { User } from '@to-apertado/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  requireAuth: (action?: string) => boolean
  loginSheetOpen: boolean
  loginSheetAction: string
  openLoginSheet: (action?: string) => void
  closeLoginSheet: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginSheetOpen, setLoginSheetOpen] = useState(false)
  const [loginSheetAction, setLoginSheetAction] = useState('')

  useEffect(() => {
    apiFetch<User>('/me')
      .then(res => setUser(res))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  const openLoginSheet = useCallback((action = '') => {
    setLoginSheetAction(action)
    setLoginSheetOpen(true)
  }, [])

  const closeLoginSheet = useCallback(() => setLoginSheetOpen(false), [])

  const requireAuth = useCallback((action = '') => {
    if (user) return true
    openLoginSheet(action)
    return false
  }, [user, openLoginSheet])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      logout,
      requireAuth,
      loginSheetOpen,
      loginSheetAction,
      openLoginSheet,
      closeLoginSheet,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
