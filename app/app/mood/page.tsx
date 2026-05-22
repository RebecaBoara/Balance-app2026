'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { saveMoodEntry, getTodaysMood } from '@/lib/db'
import { MOOD_CONFIG } from '@/lib/mood'
import { MoodType } from '@/types'
import Spinner        from '@/components/ui/Spinner'
import MoodPill       from '@/components/mood/MoodPill'
import DailySparkCard from '@/components/mood/DailySparkCard'
import MoodRecommendations, { MoodSupportCard } from '@/components/mood/MoodRecommendations'
import { AlertCircle } from 'lucide-react'
import UserAvatarMenu from '@/components/ui/UserAvatarMenu'
import Button from '@/components/ui/Button'

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
  const savedMoodRef        = useRef<MoodType | null>(null)
  const savedAiSparkRef      = useRef<string | null>(null)
  const savedAiSuggestionRef = useRef<string | null>(null)
  const [aiSpark,       setAiSpark]       = useState<string | null>(null)
  const [aiSuggestion,  setAiSuggestion]  = useState<string | null>(null)
  const [aiLoading,     setAiLoading]     = useState(false)
  const aiCacheRef = useRef<Map<string, { spark?: string; suggestion?: string }>>(new Map())
  const generalLoadedRef = useRef(false)

  async function fetchAiForMood(mood: MoodType | null): Promise<{ spark?: string; suggestion?: string } | null> {
    if (!user) return null
    const moodKey = mood ?? 'general'
    const cached = aiCacheRef.current.get(moodKey)
    if (cached) return cached

    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/ai/daily-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ mood: mood ?? 'general' }),
      })
      if (!res.ok) return null
      const data = (await res.json()) as { spark?: string; suggestion?: string }
      aiCacheRef.current.set(moodKey, data)
      return data
    } catch {
      return null
    }
  }

  // On mood selection: fetch mood-specific spark + suggestion (debounced + cached)
  // Skip if mood matches the saved entry, because Firestore already has persisted content.
  useEffect(() => {
    if (!selected || !user) return
    if (selected === savedMoodRef.current) {
      if (savedAiSparkRef.current)      setAiSpark(savedAiSparkRef.current)
      if (savedAiSuggestionRef.current) setAiSuggestion(savedAiSuggestionRef.current)
      return
    }
    setAiSuggestion(null)
    setAiLoading(true)
    const timeout = setTimeout(() => {
      fetchAiForMood(selected)
        .then((data) => {
          if (data?.suggestion) setAiSuggestion(data.suggestion)
        })
        .finally(() => setAiLoading(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [selected, user])

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
          savedMoodRef.current        = entry.mood
          savedAiSparkRef.current      = entry.aiSpark      ?? null
          savedAiSuggestionRef.current = entry.aiSuggestion ?? null
          setSelected(entry.mood)
          setAlreadyCheckedIn(true)
          setAiSpark(entry.aiSpark      ?? null)
          setAiSuggestion(entry.aiSuggestion ?? null)
        } else if (!generalLoadedRef.current) {
          generalLoadedRef.current = true
          const generalData = await fetchAiForMood(null)
          if (generalData?.spark) setAiSpark(generalData.spark)
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
      await saveMoodEntry(user.uid, selected, note, aiSpark ?? undefined, aiSuggestion ?? undefined)
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
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 pb-52 md:pb-36">

      {/* Header */}
      <div className="px-6 md:px-0 pt-4 pb-4 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-2xl text-sage-800 dark:text-white leading-tight">
            {greeting}, <span className="text-sage-800 dark:text-white">{firstName}</span> 🌿
          </h1>
          <p className="text-sm text-sage-600 dark:text-white/70 mt-1">{dateStr}</p>
        </div>
        <UserAvatarMenu />
      </div>

      {/* Daily spark */}
      <DailySparkCard mood={selected} aiSpark={aiSpark} />

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

        <p className="text-md font-medium text-sage-800 dark:text-white mb-4">
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
                          bg-white dark:bg-ocean-800
                          border border-sage-500/15 dark:border-ocean-600
                          animate-fade-in shadow-raised">
            <p className="text-sm font-semibold text-sage-700 dark:text-teal-400
                          uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span aria-hidden="true">✦</span> Balance suggests
            </p>
            {aiLoading ? (
              <p className="text-sm text-sage-500 dark:text-white/50 italic">Personalising suggestion…</p>
            ) : (
              <>
                <p className="text-sm text-sage-700 dark:text-white/80 leading-relaxed">
                  {aiSuggestion ?? MOOD_CONFIG[selected].suggestion}
                </p>
                {!aiSuggestion && MOOD_CONFIG[selected].breakSuggestion && (
                  <p className="text-sm text-sage-600 dark:text-white/70 mt-2 leading-relaxed">
                    {MOOD_CONFIG[selected].breakSuggestion}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Activities + Music side by side */}
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

        {/* Support card — low moods only */}
        {selected && (selected === 'exhausted' || selected === 'stressed') && (
          <MoodSupportCard />
        )}

      </div>

      {/* Sticky CTA sits above bottom nav on mobile, at bottom on desktop */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 z-20
                      bg-warm-100/90 dark:bg-ocean-900/90 backdrop-blur-sm
                      border-t border-sage-200 dark:border-ocean-700
                      px-6 py-4 flex flex-col gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!selected || loading}
          fullWidth
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            alreadyCheckedIn ? 'Update my mood →' : 'Go to my tasks →'
          )}
        </Button>
        <Button
          onClick={() => router.push('/app/tasks')}
          variant="ghost"
          className="text-center text-sm text-sage-400 dark:text-white/70 hover:text-sage-600 py-1"
        >
          Skip for today
        </Button>
      </div>
    </div>
  )
}
