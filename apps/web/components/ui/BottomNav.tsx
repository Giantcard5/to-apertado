'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Search, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/',          icon: Map,    label: 'Mapa' },
  { href: '/busca',     icon: Search, label: 'Buscar' },
  { href: '/registrar', icon: Plus,   label: 'Adicionar' },
  { href: '/perfil',    icon: User,   label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] flex h-16 items-stretch border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {tabs.map(({ href, icon: Icon, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px]',
              isActive
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={href === '/registrar' && !isActive ? '' : ''}
            />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
