// components/ui/Spinner.tsx
export default function Spinner({
  size    = 'md',
  variant = 'default',
}: {
  size?:    'sm' | 'md' | 'lg'
  variant?: 'default' | 'white'
}) {
  const sizes    = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  const variants = {
    default: 'border-sage-200 dark:border-ocean-600 border-t-sage-500 dark:border-t-teal-400',
    white:   'border-white/30 border-t-white',
  }
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} border-2 ${variants[variant]} rounded-full animate-spin`}
    />
  )
}