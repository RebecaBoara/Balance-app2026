'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { saveUserProfile } from '@/lib/db'
import Logo    from '@/components/ui/Logo'
import Spinner from '@/components/ui/Spinner'
import { ArrowRight, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'

const HOW_IT_WORKS = [
  {
    emoji: '😊',
    title: 'Check in with your mood',
    desc:  'Start each day by selecting how you feel. Takes just 5 seconds.',
  },
  {
    emoji: '✦',
    title: 'Get AI-powered recommendations',
    desc:  'Balance uses AI to surface tasks and suggestions that match your mood and energy level.',
  },
  {
    emoji: '📈',
    title: 'Track your patterns',
    desc:  'See insights about when you work best and what helps you thrive.',
  },
]

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router            = useRouter()
  const [step,         setStep]         = useState(0)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-100 dark:bg-ocean-900">
        <Spinner size="md" />
      </div>
    )
  }

  const firstName = user.displayName?.split(' ')[0] ?? 'there'

  async function handleSkip() {
    await saveUserProfile(user!.uid, { hasOnboarded: true })
    router.push('/app/mood')
  }

  async function handleComplete() {
    setSaving(true)
    try {
      await saveUserProfile(user!.uid, { hasOnboarded: true, reminderTime })
      router.push('/app/mood')
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Logo size="md" />

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300
              ${i === step
                ? 'w-6 bg-sage-500 dark:bg-teal-400'
                : i < step
                  ? 'w-2 bg-sage-300 dark:bg-teal-600'
                  : 'w-2 bg-sage-200 dark:bg-ocean-600'
              }`}
            />
          ))}
        </div>

        <button onClick={handleSkip}
          className="text-xs text-sage-400 hover:text-sage-600 dark:hover:text-white/60 transition-colors">
          Skip
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md animate-fade-in" key={step}>

          {/* Welcome*/}
          {step === 0 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🌿</div>
              <h1 className="font-serif text-4xl text-sage-900 dark:text-white mb-4">
                Welcome, {firstName}
              </h1>
              <p className="text-sage-600 dark:text-white/70 leading-relaxed mb-10 max-w-sm mx-auto">
                Balance is your emotion-aware planner. It recommends the right tasks for your mood — so you work with your energy, not against it.
              </p>
              <button onClick={() => setStep(1)}
                className="btn-primary px-8 inline-flex items-center gap-2">
                Let's get started <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/*  How it works */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl text-sage-900 dark:text-white mb-2">
                  Here's how it works
                </h1>
                <p className="text-sm text-sage-500 dark:text-white/60">
                  Three simple steps to better productivity
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {HOW_IT_WORKS.map(({ emoji, title, desc }, i) => (
                  <div key={i}
                    className="flex items-start gap-4 p-4 rounded-xl
                               bg-white dark:bg-ocean-800
                               border border-sage-100 dark:border-ocean-600
                               shadow-raised">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                    <div>
                      <p className="font-medium text-sage-800 dark:text-white text-sm mb-1">{title}</p>
                      <p className="text-xs text-sage-500 dark:text-ocean-300 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm
                             text-sage-500 dark:text-white/60 hover:text-sage-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/*Reminder */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-sage-50 dark:bg-ocean-800
                              flex items-center justify-center mx-auto mb-6
                              border border-sage-100 dark:border-ocean-600">
                <Clock className="w-7 h-7 text-sage-500 dark:text-teal-400" aria-hidden="true" />
              </div>
              <h1 className="font-serif text-3xl text-sage-900 dark:text-white mb-2">
                Set your reminder
              </h1>
              <p className="text-sm text-sage-500 dark:text-white/60 mb-8 leading-relaxed max-w-xs mx-auto">
                Choose a daily time for your mood check-in. You can change this anytime in Settings.
              </p>

              <div className="bg-white dark:bg-ocean-800 border border-sage-100 dark:border-ocean-600
                              rounded-xl p-6 mb-8 shadow-raised text-left">
                <label className="block text-xs font-semibold text-sage-400 dark:text-white/40
                                  uppercase tracking-wider mb-3">
                  Daily reminder time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="input text-center text-lg font-medium"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm
                             text-sage-500 dark:text-white/60 hover:text-sage-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Ready*/}
          {step === 3 && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-sage-500 dark:text-teal-400 mx-auto mb-6"
                aria-hidden="true" />
              <h1 className="font-serif text-3xl text-sage-900 dark:text-white mb-3">
                You're all set!
              </h1>
              <p className="text-sage-600 dark:text-white/70 leading-relaxed mb-10 max-w-sm mx-auto">
                Start by checking in with how you're feeling right now. Balance will recommend the best tasks for your mood.
              </p>

              <button onClick={handleComplete} disabled={saving}
                className="btn-primary px-8 inline-flex items-center gap-2 mb-4">
                {saving
                  ? <><Spinner size="sm" /> Setting up…</>
                  : <>Start my first check-in <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                }
              </button>

              <button onClick={() => setStep(2)}
                className="block text-xs text-sage-400 hover:text-sage-600 transition-colors mx-auto">
                ← Back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
