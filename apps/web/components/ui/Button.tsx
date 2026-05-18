import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-2xl font-semibold',
    'transition-all duration-180 btn-press',
    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white',
          'hover:-translate-y-0.5 hover:shadow-primary-md',
          'active:shadow-primary-sm',
        ].join(' '),
        secondary: [
          'bg-surface-2 text-text-primary',
          'hover:bg-surface-3 hover:-translate-y-0.5 hover:shadow-card',
          'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        ].join(' '),
        ghost: [
          'text-text-muted',
          'hover:bg-surface-2 hover:text-text-primary',
          'dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-100',
        ].join(' '),
        danger: [
          'bg-error text-white',
          'hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(255,71,87,0.3)]',
        ].join(' '),
        accent: [
          'bg-accent text-white',
          'hover:-translate-y-0.5 hover:shadow-accent-md',
          'active:shadow-accent-sm',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
