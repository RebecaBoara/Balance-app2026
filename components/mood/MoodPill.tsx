'use client'
// Individual mood selection pill
// Used in the mood check-in screen

import { MoodType } from '@/types'

const SELECTED_STYLES: Record<MoodType, string> = {
  exhausted: 'border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400',
  stressed:  'border-2 border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-400',
  neutral:   'border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-400',
  good:      'border-2 border-sage-500 bg-sage-50 dark:bg-sage-900/20 dark:border-sage-400',
  energised: 'border-2 border-sky-400 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-400',
}

interface MoodPillProps {
  type:       MoodType
  emoji:      string
  label:      string
  selected:   boolean
  onSelect:   (mood: MoodType) => void
}

export default function MoodPill({
  type, emoji, label, selected, onSelect
}: MoodPillProps) {
  return (
    <button
      onClick={() => onSelect(type)}
      aria-pressed={selected}
      aria-label={label}
      className={`mood-pill transition-all duration-200
                  ${selected
                    ? SELECTED_STYLES[type] + ' scale-105 shadow-card'
                    : 'border-sage-500/15 dark:border-ocean-600 bg-white dark:bg-ocean-700 lp-card-shadow animate-fade-in'
                  }`}
    >
      <span
        className="text-2xl"
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="text-sm font-medium text-sage-600 dark:text-white/80
                       text-center leading-tight">
        {label}
      </span>
    </button>
  )
}