'use client'
//  toggle: Light / Dark
// Used in sidebar and settings screen

import { useTheme } from '@/components/layout/ThemeProvider'
import { Sun, Moon } from 'lucide-react'
const OPTIONS = [
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className="flex items-center gap-1 p-1 rounded-lg
                 bg-warm-100 dark:bg-ocean-700
                 border border-sage-500/15 dark:border-ocean-600"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          aria-label={`${label} theme`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md
                      text-sm font-medium transition-all duration-200
                      ${theme === value
                        ? 'bg-white dark:bg-ocean-600 text-sage-700 dark:text-white shadow-sm'
                        : 'text-sage-700 dark:text-white/70 hover:text-sage-900 dark:hover:text-white'
                      }`}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}