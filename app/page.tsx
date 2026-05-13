'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu, X, Moon, Sun, Monitor, ChevronDown,
  Target, BarChart3, Sparkles, Coffee, Lock, ArrowRight, Check, 
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth  } from '@/hooks/useAuth'
import Logo from '@/components/ui/Logo'
import { MOOD_CONFIG } from '@/lib/mood'
import type { MoodType } from '@/types'

const SAGE_GRADIENT = 'linear-gradient(135deg, #3D5248 0%, #4C6659 50%, #536E60 100%)'

// Navbar

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'FAQ',          href: '#faq'           },
]

function Navbar() {
  const [open, setOpen]     = useState(false)
  const { theme, setTheme } = useTheme()
  const { user }            = useAuth()

  function cycleTheme() {
    if (theme === 'dark')       setTheme('light')
    else if (theme === 'light') setTheme('system')
    else                        setTheme('dark')
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="sticky top-0 z-50 bg-[#FDFAF5] dark:bg-ocean-900
                       border-b border-sage-100 dark:border-ocean-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Logo size="sm" />

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-6 mr-2" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={href} href={href}
                className="text-sm text-sage-600 dark:text-white/80 hover:text-sage-900 dark:hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </nav>
          <button onClick={cycleTheme} aria-label="Toggle theme"
            className="p-2 text-sage-500 dark:text-white/80 hover:text-sage-900 dark:hover:text-white transition-colors">
            <ThemeIcon size={17} aria-hidden="true" />
          </button>
          {user ? (
            <Link href="/app/mood"
              className="px-4 py-2 rounded-sm text-sm font-medium bg-sage-700 text-white
                         hover:bg-sage-800 transition-colors">
              Go to app →
            </Link>
          ) : (
            <>
              <Link href="/auth/login"
                className="hidden md:block text-sm text-sage-600 dark:text-white/80 hover:text-sage-900 dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/auth/signup"
                className="px-4 py-2 rounded-sm text-sm font-medium bg-sage-700 text-white
                           hover:bg-sage-800 transition-colors">
                Get started free
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden p-2 text-sage-600 dark:text-white/70 hover:text-sage-900 dark:hover:text-white transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile navigation"
          className="md:hidden bg-[#FDFAF5] dark:bg-ocean-900 border-t border-sage-100
                     dark:border-ocean-700 px-6 py-4 space-y-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block text-sm text-sage-600 dark:text-white/80 py-2">
              {label}
            </a>
          ))}
          {user ? (
            <Link href="/app/mood" onClick={() => setOpen(false)}
              className="block text-center px-4 py-3 rounded-sm text-sm font-medium
                         bg-sage-700 text-white hover:bg-sage-800 transition-colors">
              Go to app →
            </Link>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block text-center px-4 py-3 rounded-sm border border-sage-200
                           dark:border-white/30 text-sm font-medium text-sage-600 dark:text-white/80">
                Log in
              </Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)}
                className="block text-center px-4 py-3 rounded-sm text-sm font-medium
                           bg-sage-700 text-white hover:bg-sage-800 transition-colors">
                Get started free
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

// FAQ data

const FAQS = [
  {
    q: 'How does Balance match tasks to my mood?',
    a: 'Each day you select one of five mood states — Exhausted, Stressed, Neutral, Good, or Energised. Balance uses this to filter your task list by difficulty and set a cap on how many tasks to show, so you always see a realistic and manageable set of work.',
  },{
    q: 'Is Balance really free?',
    a: 'Yes — Balance is completely free during the research phase. It was built as part of a dissertation project at Southampton Solent University and is available at no cost to participants.',
  },
  {
    q: 'What are the 5 mood states?',
    a: 'Exhausted (only easy tasks, up to 3), Stressed (easy tasks only, up to 4), Neutral (easy and medium, up to 5), Good (all difficulties, up to 6), and Energised (all difficulties, up to 8 tasks prioritising the hardest first).',
  },{q: 'How is this different from other to-do apps?',
    a: 'Most task managers treat every day the same. Balance adapts to how you actually feel — surfacing easier tasks on hard days and your most challenging work on good days. It also tracks how your mood and productivity relate over time.',
  },
  {
    q: 'Can I use Balance on mobile?',
    a: 'Yes. Balance is designed mobile-first and works in any modern browser on Android, iOS, and desktop. No app store download is required — just open it in your browser.',
  },
  { q: 'How does Balance protect my privacy?',
    a: 'Your mood and task data is stored in Firebase Firestore with strict server-side security rules. Only you can access your own data. It is never sold, shared, or used for advertising.',
  },
  {
    q: 'Can I use Balance without checking in?',
    a: 'Yes — check-ins are encouraged but optional. Without one, your full task list shows without mood filtering.'
  },
]

// Mood pill colours (demo section — always on dark bg) 

const MOOD_PILL_SELECTED: Record<MoodType, string> = {
  exhausted: 'border-purple-400 bg-purple-400/20 text-purple-200',
  stressed:  'border-coral-app  bg-coral-app/20  text-coral-pale',
  neutral:   'border-amber-app  bg-amber-app/20  text-amber-200',
  good:      'border-teal-400   bg-teal-400/20   text-teal-200',
  energised: 'border-sky-400    bg-sky-400/20    text-sky-200',
}

//Page 

export default function LandingPage() {
  const { user }                         = useAuth()
  const [selectedMood, setSelectedMood]  = useState<MoodType | null>(null)
  const [openFaq,      setOpenFaq]       = useState<number | null>(null)
  const moods = Object.values(MOOD_CONFIG) as (typeof MOOD_CONFIG)[MoodType][]

  return (
    <>
      <Navbar />

      <main>

        {/* Hero
        <section className="lp-bg-1 pt-16 pb-14 px-6 text-center">
          <div className="max-w-3xl mx-auto">

            <span className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full
                             bg-[var(--lp-badge-bg)] border border-[var(--lp-badge-b)]
                             text-xs font-semibold lp-accent uppercase tracking-widest">
              🌿 Emotion-aware productivity
            </span>

            <h1 className="font-serif text-5xl md:text-6xl lp-text leading-tight mb-6">
              Your tasks, in tune with<br />
              <em className="font-script not-italic" style={{ color: 'var(--lp-accent)' }}>
                how you feel
              </em>
            </h1>

            <p className="text-lg lp-text-60 max-w-xl mx-auto mb-10 leading-relaxed">
              Balance adapts your task list to how you feel — reducing overwhelm, improving focus, and supporting your mental well-being. Start each day with a motivational message and a plan that works for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link href="/auth/signup"
                className="lp-cta px-6 py-3 rounded-xl font-semibold text-sm transition-opacity">
                Get started free
              </Link>
              <a href="#how-it-works"
                className="lp-ghost px-6 py-3 rounded-xl border text-sm transition-all">
                See how it works
              </a>
            </div>

            <div className="flex justify-center gap-8 sm:gap-16 text-center">
              {[
                { value: '5',    label: 'Mood states'  },
                { value: '3×',   label: 'Mood tasks'   },
                { value: '100%', label: 'Free'         },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-serif text-3xl font-semibold" style={{ color: 'var(--lp-accent)' }}>{value}</p>
                  <p className="text-xs lp-text-40 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── HERO + STATS grouped ── */}
        <section className="pt-20 pb-10 px-6 bg-white dark:bg-ocean-900">
          <div className="max-w-6xl mx-auto">

            {/* Two column on desktop */}
            <div className="grid md:grid-cols-2 gap-10 items-center mb-10">

              {/* Left */}
              <div>

                <h1 className="font-serif text-4xl lg:text-5xl text-sage-900 dark:text-white leading-tight mb-4">
                  Your tasks, in tune with{' '}
                  <em className="text-sage-500 dark:text-teal-400 not-italic">how you feel</em>
                </h1>

                <p className="text-base text-sage-700 dark:text-white/90 leading-relaxed mb-6 max-w-lg">
                  Balance recommends the right tasks at the right time — based on your mood, not just your to-do list.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link href="/auth/signup"
                    className="btn-primary flex items-center justify-center gap-2">
                    Get started free
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-ghost">
                    See how it works
                  </button>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap gap-4 text-xs text-sage-700 dark:text-white/90">
                  {['Free forever', 'GDPR compliant', 'No credit card needed', 'Works on all devices'].map(t => (
                    <span key={t} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-sage-500" aria-hidden="true" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: interactive mood demo */}
              <div className="hidden md:block">
                <div className="rounded-sm overflow-hidden shadow-raised" style={{ background: SAGE_GRADIENT }}>
                  <div className="p-6">
                    <p className="text-xs text-white/80 uppercase tracking-wider mb-3">
                      Try it — select your mood
                    </p>

                    <div className="grid grid-cols-5 gap-1.5 mb-5">
                      {moods.map(({ mood, emoji, label }) => (
                        <button key={mood}
                          onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                          aria-pressed={selectedMood === mood}
                          className={`flex flex-col items-center gap-1 px-1 py-2 rounded-2xl border text-[11px] font-medium
                                      transition-all duration-200
                                      ${selectedMood === mood
                                        ? MOOD_PILL_SELECTED[mood] + ' scale-105'
                                        : 'border-white/20 bg-white/5 text-white hover:border-white/70'
                                      }`}>
                          <span role="img" aria-label={label}>{emoji}</span>
                          {label}
                        </button>
                      ))}
                    </div>

                    {selectedMood ? (
                      <div className="bg-sage-900/60 border border-white/10 p-4 rounded-sm animate-[fadeIn_0.25s_ease]">
                        <p className="text-xs text-white/80 uppercase tracking-widest mb-2">
                          Balance suggests:
                        </p>
                        <p className="font-serif text-white text-lg mb-2">
                          {MOOD_CONFIG[selectedMood].emoji} {MOOD_CONFIG[selectedMood].label}
                        </p>
                        <p className="text-white/70 text-xs leading-relaxed mb-3">
                          {MOOD_CONFIG[selectedMood].suggestion}
                        </p>
                        <p className="text-xs text-white/80 italic">
                          {MOOD_CONFIG[selectedMood].breakSuggestion}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/10 border border-white/10 p-4 rounded-sm">
                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">✦ Daily spark</p>
                        <p className="font-serif italic text-white text-sm leading-relaxed">
                          "Great days like this are when the best work happens."
                        </p>
                        <p className="text-xs text-white/60 mt-3">← Pick a mood to see your plan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-sage-100 dark:border-ocean-700">
              {[
                { num: '5',    label: 'Mood states tracked'  },
                { num: '3×',   label: 'More tasks completed' },
                { num: '100%', label: 'Free to use'          },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <div className="font-serif text-2xl md:text-3xl text-sage-800 dark:text-white">{num}</div>
                  <div className="text-xs text-sage-600 dark:text-white/90 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/*How it works*/}
        <section id="how-it-works" className="lp-bg-2 py-14 px-6 scroll-mt-16">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-semibold lp-accent uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Three simple steps to better productivity
            </h2>
            <p className="text-sm lp-text-90 max-w-lg mx-auto mb-8 leading-relaxed">
              Balance makes emotion-aware productivity effortless with a simple daily routine
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  step: '01', emoji: '😊',
                  title: 'Check in with your mood',
                  body: 'Start each session by selecting how you feel right now. Takes just 5 seconds.',
                },
                {
                  step: '02', emoji: '✨',
                  title: 'Get personalised suggestions',
                  body: 'Balance instantly prioritises tasks that match your current energy and emotional state.',
                },
                {
                  step: '03', emoji: '📊',
                  title: 'Track your patterns',
                  body: 'See insights about your productivity rhythm and learn what works best for you.',
                },
              ].map(({ step, emoji, title, body }) => (
                <div key={step} className="lp-card border lp-border lp-card-shadow p-7">
                  <span className="font-serif text-sm font-semibold lp-accent block mb-4">
                    {step}
                  </span>
                  <span className="text-3xl block mb-4" aria-hidden="true">{emoji}</span>
                  <h3 className="font-semibold lp-text text-sm mb-2">{title}</h3>
                  <p className="text-sm lp-text-60 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*Features */}
        <section id="features" className="lp-bg-1 py-14 px-6 scroll-mt-16">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs font-semibold lp-accent uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Everything you need to thrive
            </h2>
            <p className="text-sm lp-text-80 max-w-lg mx-auto mb-8 leading-relaxed">
              Tools that adapt to your energy, protect your focus, and support your well-being every day.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 text-left">
              {[
                {
                  icon: Target,   title: 'Mood-based task planning',
                  body: 'Your daily plan adapts to your mood so each day feels realistic, not overwhelming.',
                },
                {
                  icon: BarChart3, title: 'Mood & productivity insights',
                  body: 'See how your mood and progress connect over time, so you can plan with more confidence.',
                },
                {
                  icon: Sparkles, title: 'Daily motivational message',
                  body: 'Start each check-in with an encouraging message to help you begin with clarity.',
                },
                {
                  icon: Coffee,   title: 'Supportive break suggestions',
                  body: 'Balance recommends breaks based on your mood — so you rest before you burn out.',
                },
                {
                  icon: Moon,     title: 'Calm, flexible interface',
                  body: 'Choose light or dark mode to match your environment and make planning feel easier on your eyes.',
                },
                {
                  icon: Lock,     title: 'Privacy first approach',
                  body: 'Your mood and task data stays private, stored securely with no third-party sharing.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title}
                  className="bg-white dark:bg-ocean-700 border lp-border lp-card-shadow p-6
                             hover:border-[var(--lp-accent)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lp-badge-bg)] flex items-center
                                  justify-center mb-4">
                    <Icon size={20} className="lp-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold lp-text text-sm mb-2">{title}</h3>
                  <p className="text-sm lp-text-60 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*FAQ  */}
        <section id="faq" className="lp-bg-1 py-14 px-6 scroll-mt-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold lp-accent uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Frequently asked questions
            </h2>
            <p className="text-sm lp-text-80 mb-12">
              Everything you need to know about Balance
            </p>

            <div className="space-y-2 text-left">
              {FAQS.map(({ q, a }, i) => (
                <div key={i}
                  className="border lp-border rounded-xl overflow-hidden
                             hover:border-[var(--lp-accent)] transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="w-full flex items-center justify-between px-5 py-4
                               text-left text-sm font-medium lp-text-80 hover:lp-text
                               transition-colors">
                    {q}
                    <ChevronDown size={16} aria-hidden="true"
                      className={`flex-shrink-0 ml-4 lp-text-80 transition-transform duration-200
                                  ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm lp-text-70 leading-relaxed
                                    animate-[fadeIn_0.2s_ease]">
                      {a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/*Footer*/}
      <footer style={{ backgroundColor: '#3D5248' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">

            <div className="col-span-2 md:col-span-1">
              <span className="font-script text-2xl text-white">Balance</span>
              <p className="text-sm text-white/75 mt-2 leading-relaxed">
                Your tasks, in tune with how you feel.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/75 uppercase tracking-widest mb-4">
                Product
              </p>
              <ul className="space-y-3">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Features',     href: '#features'     },
                  { label: 'FAQ',          href: '#faq'          },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/75 uppercase tracking-widest mb-4">
                Contact
              </p>
              <a href="mailto:balancedtasks.mood@gmail.com"
                className="text-sm text-white/75 hover:text-white transition-colors break-all">
                balancedtasks.mood@gmail.com
              </a>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/75 uppercase tracking-widest mb-4">
                Legal
              </p>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy',   href: '/privacy'      },
                  { label: 'Terms of Service', href: '/terms'        },
                  { label: 'GDPR Rights',      href: '/privacy#gdpr' },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/75 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row
                          items-center justify-between gap-4">
            <p className="text-xs text-white/75">
              © 2026 Balance. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-white/75 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-white/75 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
