import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}

const imgSizeMap = { sm: 32, md: 40, lg: 64 }

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = imgSizeMap[size]
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold overflow-hidden',
        sizeMap[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} width={px} height={px} className="object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
