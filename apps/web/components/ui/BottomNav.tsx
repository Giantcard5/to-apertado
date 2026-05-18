'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Search, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEFT_TABS  = [
  { href: '/',      icon: Map,    label: 'Mapa' },
  { href: '/busca', icon: Search, label: 'Buscar' },
]
const RIGHT_TABS = [
  { href: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()
  const isRegister = pathname.startsWith('/registrar')

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-[9999]',
      'flex h-16 items-stretch',
      'border-t border-white/60 shadow-nav',
      'bg-white/85 backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]',
      'dark:bg-gray-900/85 dark:border-white/10',
      // Safe-area for notch/home-indicator devices
      'pb-safe',
    )}>
      {/* Left tabs */}
      {LEFT_TABS.map(({ href, icon: Icon, label }) => (
        <NavTab key={href} href={href} label={label} active={isActive(href)}>
          <Icon size={22} strokeWidth={isActive(href) ? 2.5 : 1.8} />
        </NavTab>
      ))}

      {/* Central FAB — "Adicionar banheiro" */}
      <div className="relative flex flex-1 items-center justify-center">
        <Link
          href="/registrar"
          aria-label="Adicionar banheiro"
          className={cn(
            'absolute -top-5',
            'flex h-14 w-14 items-center justify-center rounded-2xl',
            'transition-all duration-200 btn-press',
            'outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2',
            isRegister
              ? 'bg-accent text-white shadow-accent-md'
              : 'bg-primary text-white shadow-primary-md hover:shadow-primary-lg hover:-translate-y-0.5',
          )}
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Right tabs */}
      {RIGHT_TABS.map(({ href, icon: Icon, label }) => (
        <NavTab key={href} href={href} label={label} active={isActive(href)}>
          <Icon size={22} strokeWidth={isActive(href) ? 2.5 : 1.8} />
        </NavTab>
      ))}
    </nav>
  )
}

function NavTab({
  href,
  label,
  active,
  children,
}: {
  href: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2',
        active
          ? 'text-primary dark:text-primary'
          : 'text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-200',
      )}
    >
      {children}
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
      {/* Active indicator dot */}
      <span className={cn(
        'h-1 w-1 rounded-full bg-primary transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
      )} />
    </Link>
  )
}
