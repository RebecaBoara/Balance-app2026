'use client'

// Displays the Balance mood suggestion on the task list screen
// Shows a prompt to check in if no mood recorded today

import Link from 'next/link'
import { MoodType } from '@/types'
import { MOOD_CONFIG } from '@/lib/mood'
import MoodBadge from '@/components/ui/MoodBadge'
import { Sparkles } from 'lucide-react'

interface MoodSuggestionBannerProps {
  mood:          MoodType | null
  aiSuggestion?: string
}

export default function MoodSuggestionBanner({ mood, aiSuggestion }: MoodSuggestionBannerProps) {

  // No mood checked in
  if (!mood) {
    return (
      <div className="mb-4 p-4 rounded-sm
                      bg-amber-pale dark:bg-amber-900/20
                      border border-amber-app/30
                      animate-fade-in">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <span className="font-medium">No mood check-in today.</span>{' '}
          <Link
            href="/app/mood"
            className="underline hover:no-underline font-medium"
          >
            Check in now
          </Link>{' '}
          to get personalised task recommendations.
        </p>
      </div>
    )
  }

  // Mood checked in 
  const config = MOOD_CONFIG[mood]

  return (
    <div className="mb-4 p-4 rounded-sm
                    bg-white dark:bg-ocean-700
                    border border-sage-500/15 dark:border-ocean-600
                    shadow-raised animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-sage-700 dark:text-teal-400
                      uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Balance suggests
        </p>
        <MoodBadge mood={mood} />
      </div>
      <p className="text-sm text-sage-700 dark:text-white/80 leading-relaxed">
        {aiSuggestion ?? config.suggestion}
      </p>
      {!aiSuggestion && config.breakSuggestion && (
        <p className="text-sm text-sage-700 dark:text-white/70 mt-3 leading-relaxed">
          {config.breakSuggestion}
        </p>
      )}
    </div>
  )
}
