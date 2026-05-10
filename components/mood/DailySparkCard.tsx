'use client'

// Daily motivational message card
// Shown on the mood check-in screen after mood is selected


import { MoodType } from '@/types'
import { getDailySparkMessage } from '@/lib/mood'
import { Sparkles } from 'lucide-react'

interface DailySparkCardProps {
  mood: MoodType
}

export default function DailySparkCard({ mood }: DailySparkCardProps) {
  return (
    <div className="mx-6 md:mx-0 mb-5 p-4 rounded-sm
                    bg-gradient-to-br from-sage-700 to-sage-500
                    dark:from-ocean-700 dark:to-ocean-600
                    relative overflow-hidden  animate-fade-in">
      {/* Decorative blob*/}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full
                      bg-white/5 -translate-y-8 translate-x-8
                      pointer-events-none" />

      <p className="text-sm font-semibold text-white/60 uppercase
                    tracking-wider mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" aria-hidden="true" />
        Daily spark
      </p>
      <p className="font-serif italic text-white text-sm leading-relaxed
                    relative z-10">
        "{getDailySparkMessage(mood)}"
      </p>
    </div>
  )
}