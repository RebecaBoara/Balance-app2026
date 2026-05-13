'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { saveMoodEntry, getTodaysMood } from '@/lib/db'
import { MOOD_CONFIG } from '@/lib/mood'
import { MoodType } from '@/types'
import Spinner        from '@/components/ui/Spinner'
import MoodPill       from '@/components/mood/MoodPill'
import DailySparkCard from '@/components/mood/DailySparkCard'
import MoodRecommendations from '@/components/mood/MoodRecommendations'
import { AlertCircle } from 'lucide-react'
import UserAvatarMenu from '@/components/ui/UserAvatarMenu'

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'exhausted', emoji: '😴', label: 'Exhausted' },
  { type: 'stressed',  emoji: '😟', label: 'Stressed'  },
  { type: 'neutral',   emoji: '😐', label: 'Neutral'   },
  { type: 'good',      emoji: '🙂', label: 'Good'      },
  { type: 'energised', emoji: '😄', label: 'Energised' },
]

export default function MoodPage() {
  const router                          = useRouter()
  const { user }                        = useAuth()
  const [selected, setSelected]         = useState<MoodType | null>(null)
  const [note,     setNote]             = useState('')
  const [loading,  setLoading]          = useState(false)
  const [checking, setChecking]         = useState(true)
  const [loadError, setLoadError]       = useState(false)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false)

  const now       = new Date()
  const hour      = now.getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr   = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  useEffect(() => {
    async function checkToday() {
      if (!user) return
      try {
        const [entry, profile] = await Promise.all([
          getTodaysMood(user.uid),
          import('@/lib/db').then(m => m.getUserProfile(user.uid)),
        ])
        if (profile?.hasOnboarded === false) { router.push('/onboarding'); return }
        if (entry) {
          setSelected(entry.mood)
          setAlreadyCheckedIn(true)
        }
      } catch (e) {
        console.error(e)
        setLoadError(true)
      } finally {
        setChecking(false)
      }
    }
    checkToday()
  }, [user])

  async function handleSubmit() {
    if (!selected || !user) return
    setLoading(true)
    try {
      await saveMoodEntry(user.uid, selected, note)
      router.push('/app/tasks')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 pb-24">

      {/* Header */}
      <div className="px-6 md:px-0 pt-4 pb-4 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-2xl text-sage-900 dark:text-white leading-tight">
            {greeting}, <span className="text-sage-900 dark:text-white">{firstName}</span> 🌿
          </h1>
          <p className="text-sm text-sage-600 dark:text-white/70 mt-1">{dateStr}</p>
        </div>
        <UserAvatarMenu />
      </div>

      {/* Daily spark */}
      {selected && <DailySparkCard mood={selected} />}

      {/* Already checked in */}
      {alreadyCheckedIn && (
        <div className="mx-6 md:mx-0 mb-4 px-4 py-3 rounded-sm
                        bg-sage-50 dark:bg-sage-900/20
                        border border-sage-200 dark:border-white/30
                        text-sage-700 dark:text-white/70 text-sm  animate-fade-in">
          ✓ You already checked in today — you can update your mood below.
        </div>
      )}

      <div className="px-6 md:px-0">

        {loadError && (
          <div className="flex items-start gap-3 mb-4 px-4 py-3 rounded-sm
                          bg-coral-pale dark:bg-coral-app/15
                          border border-coral-app/30 dark:border-coral-app/40
                          animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-800 dark:text-coral-pale flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-800 dark:text-coral-pale">
              <span className="font-semibold">Could not load today's check-in.</span>{' '}
              Check your connection and{' '}
              <button onClick={() => window.location.reload()} className="underline font-medium">
                try again
              </button>.
            </p>
          </div>
        )}

        <p className="text-lg font-medium text-sage-800 dark:text-white mb-4">
          How are you feeling right now?
        </p>
        

        {/* Mood pills */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {MOODS.map(({ type, emoji, label }) => (
            <MoodPill
              key={type}
              type={type}
              emoji={emoji}
              label={label}
              selected={selected === type}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Suggestion banner */}
        {selected && (
          <div className="mb-5 px-4 py-3 rounded-sm
                          bg-white dark:bg-ocean-800 text-sage-700 dark:text-white/80
                          border border-sage-500/15 dark:border-ocean-600
                          animate-fade-in shadow-raised lp-border">
            <p className="text-sm font-semibold text-sage-700 dark:text-white/80
                          uppercase tracking-wider mb-1">
              ✦ Balance suggests
            </p>
            <p className="text-sm text-sage-700 dark:text-white/80 leading-relaxed">
              {MOOD_CONFIG[selected].suggestion}
            </p>
          </div>
        )}

        {selected && <MoodRecommendations mood={selected} />}

        {/* Note */}
        <div className="mb-6">
          <label htmlFor="mood-note" className="label text-sage-900 dark:text-white/70">
            Add a note (optional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What's on your mind today?"
            rows={3}
            className="input resize-none"
            maxLength={300}
          />
          <p className="text-sm text-sage-300 dark:text-white/70 text-right mt-1">
            {note.length}/300
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 shadow-raised animate-fade-in"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            alreadyCheckedIn ? 'Update my mood →' : 'See my recommended tasks →'
          )}
        </button>

        {/* Skip */}
        <button
          onClick={() => router.push('/app/tasks')}
          className="w-full text-center text-sm text-sage-400 dark:text-white/70
                     hover:text-sage-600 transition-colors mt-3 py-2"
        >
          Skip for today
        </button>

      </div>
    </div>
  )
}
