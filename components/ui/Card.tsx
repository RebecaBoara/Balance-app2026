import type { ReactNode } from 'react'

type CardVariant = 'default' | 'muted' | 'danger' | 'accent'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: CardVariant
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-ocean-700 border-sage-500/15 dark:border-ocean-600',
  muted: 'bg-sage-50 dark:bg-sage-900/20 border-sage-200 dark:border-sage-700',
  danger: 'bg-coral-pale dark:bg-coral-app/15 border-coral-app/30 dark:border-coral-app/40',
  accent: 'bg-sage-500 dark:bg-teal-600 border-sage-500 dark:border-teal-600',
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  return (
    <div
      className={`rounded-sm border shadow-raised ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
