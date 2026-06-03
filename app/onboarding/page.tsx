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
  const { user, loading }                     = useAuth()
  const router                                = useRouter()
  const [step,           setStep]             = useState(0)
  const [emailReminders, setEmailReminders]   = useState(true)
  const [reminderTime,   setReminderTime]     = useState('08:00')
  const [saving,         setSaving]           = useState(false)

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
    router.refresh()
  }

  async function handleComplete() {
    setSaving(true)
    try {
      await saveUserProfile(user!.uid, {
        hasOnboarded: true,
        emailReminders,
        ...(emailReminders && {
          reminderTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })
      router.push('/app/mood')
      router.refresh()
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
          className="text-xs text-sage-600 hover:text-sage-600 dark:hover:text-white/60 transition-colors">
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
                <p className="text-sm text-sage-700 dark:text-white/70">
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
                      <p className="text-xs text-sage-700 dark:text-ocean-300 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm
                             text-sage-700 dark:text-white/70 hover:text-sage-700 transition-colors">
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
                Daily reminders
              </h1>
              <p className="text-sm text-sage-700 dark:text-white/70 mb-8 leading-relaxed max-w-xs mx-auto">
                Would you like a daily email reminder to check in with your mood?
                You can change this anytime in Settings.
              </p>

              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={() => { setEmailReminders(true); setStep(3) }}
                  className={`w-full px-5 py-4 rounded-xl border text-sm font-medium transition-all
                             ${emailReminders
                               ? 'bg-sage-50 dark:bg-ocean-700 border-sage-400 dark:border-teal-500 text-sage-800 dark:text-white'
                               : 'bg-white dark:bg-ocean-800 text-sage-700 dark:text-white/80 border-sage-200 dark:border-ocean-600 hover:bg-sage-50 dark:hover:bg-ocean-700'
                             }`}>
                  Yes, send me daily reminders
                </button>

                {/* Time picker — shown when reminders are on */}
                {emailReminders && (
                  <div className="px-4 py-3 rounded-xl border border-sage-200 dark:border-ocean-600
                                  bg-white dark:bg-ocean-800 text-left">
                    <label className="text-xs font-medium text-sage-700 dark:text-white/70 uppercase tracking-wider block mb-2">
                      Reminder time
                    </label>
                    <select
                      value={reminderTime}
                      onChange={e => setReminderTime(e.target.value)}
                      className="input text-sm w-full"
                    >
                      {Array.from({ length: 17 }, (_, i) => i + 6).map(h => {
                        const value = `${String(h).padStart(2, '0')}:00`
                        const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
                        return <option key={value} value={value}>{label}</option>
                      })}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => { setEmailReminders(false); setStep(3) }}
                  className="w-full px-5 py-4 rounded-xl border text-sm font-medium transition-all
                             bg-white dark:bg-ocean-800 text-sage-700 dark:text-white/80
                             border-sage-200 dark:border-ocean-600
                             hover:bg-sage-50 dark:hover:bg-ocean-700">
                  No thanks, I'll check in on my own
                </button>
              </div>

              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm mx-auto
                           text-sage-700 dark:text-white/70 hover:text-sage-700 transition-colors">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
              </button>
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
                className="block text-xs text-sage-600 hover:text-sage-600 transition-colors mx-auto">
                ← Back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
