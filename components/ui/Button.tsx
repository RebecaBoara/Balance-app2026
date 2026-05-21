'use client'

import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outlineDanger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  href?: string
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-sage-500 dark:bg-teal-600 text-white hover:bg-sage-700 dark:hover:bg-teal-700',
  secondary:
    'border border-sage-200 dark:border-ocean-500 bg-white dark:bg-ocean-700 text-sage-600 dark:text-white/70 hover:bg-sage-50 dark:hover:bg-ocean-600',
  ghost:
    'text-sage-600 dark:text-white/60 hover:bg-sage-50 dark:hover:bg-ocean-600',
  danger:
    'bg-red-500 text-white hover:bg-red-600',
  outlineDanger:
    'border border-coral-app dark:border-red-500/60 text-coral-app dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-3 text-sm rounded-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ').trim()

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}
