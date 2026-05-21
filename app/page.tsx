'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu, X, Moon, Sun, ChevronDown,
  Target, BarChart3, Sparkles, Coffee, Lock, ArrowRight, Check,
} from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'
import { useAuth  } from '@/hooks/useAuth'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
const LP_CONTAINER = 'w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'

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
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const ThemeIcon = theme === 'dark' ? Moon : Sun

  return (
    <header className="sticky top-0 z-50 bg-[#FDFAF5] dark:bg-ocean-900
                       border-b border-sage-100 dark:border-ocean-700 shadow-sm">
      <div className={`${LP_CONTAINER} h-16 flex items-center justify-between`}>

        <Logo size="md" />

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
            <Button href="/app/mood" size="sm" className="px-4 py-2">
              Go to app →
            </Button>
          ) : (
            <>
              <Link href="/auth/login"
                className="hidden md:block text-sm text-sage-600 dark:text-white/80 hover:text-sage-900 dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Button href="/auth/signup" size="sm" className="px-4 py-2">
                Get started free
              </Button>
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
                     dark:border-ocean-700 px-4 sm:px-6 py-4 space-y-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block text-sm text-sage-600 dark:text-white/80 py-2">
              {label}
            </a>
          ))}
          {user ? (
            <Button href="/app/mood" onClick={() => setOpen(false)} fullWidth className="py-3">
              Go to app →
            </Button>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block text-center px-4 py-3 rounded-sm border border-sage-200
                           dark:border-white/30 text-sm font-medium text-sage-600 dark:text-white/80">
                Log in
              </Link>
              <Button href="/auth/signup" onClick={() => setOpen(false)} fullWidth className="py-3">
                Get started free
              </Button>
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
    a: 'Each day you select one of five mood states — Exhausted, Stressed, Neutral, Good, or Energised. Balance uses AI to recommend the right tasks for how you feel, prioritising easy tasks on low-energy days and your hardest work when you\'re energised. It also filters by difficulty and caps the number shown so you always see a realistic, manageable set.',
  },{
    q: 'Is Balance really free?',
    a: 'Yes — Balance is completely free during the research phase. It was built as part of a dissertation project at Southampton Solent University and is available at no cost to participants.',
  },
  {
    q: 'What are the 5 mood states?',
    a: 'Exhausted, Stressed, Neutral, Good, and Energised. Each one tells Balance how much mental energy you have right now. On harder days it surfaces lighter, more manageable tasks. On good days it brings your most important work to the top — so you always see a list that feels doable, not overwhelming.',
  },{q: 'How is this different from other to-do apps?',
    a: 'Most task managers treat every day the same. Balance adapts to how you actually feel — surfacing easier tasks on hard days and your most challenging work on good days. It also tracks how your mood and productivity relate over time.',
  },
  {
    q: 'Can I use Balance on mobile?',
    a: 'Yes. Balance is designed mobile-first and works in any modern browser on Android, iOS, and desktop. No app store download is required — just open it in your browser.',
  },
  {
    q: 'How does Balance protect my privacy?',
    a: 'Your data is stored securely and only you can access it. When generating AI suggestions, only your mood (e.g. "feeling good") is used — no personal details, names, or task content is ever shared. Your data is never sold or used for advertising.',
  },
  {
    q: 'Can I use Balance without checking in?',
    a: 'Yes — check-ins are encouraged but optional. Without one, your full task list shows without mood filtering.'
  },
]

//Page

export default function LandingPage() {
  const { user }                         = useAuth()
  const [openFaq,      setOpenFaq]       = useState<number | null>(null)

  return (
    <>
      <Navbar />

      <main>

        {/* Hero
        <section className="lp-bg-1 pt-16 pb-14 px-6 text-center">
          <div className="max-w-3xl mx-auto">

            <span className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full
                             bg-[var(--lp-badge-bg)] border border-[var(--lp-badge-b)]
                             text-sm font-semibold lp-accent uppercase tracking-widest">
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
                  <p className="text-sm lp-text-40 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ── HERO + STATS grouped ── */}
        <section className="pt-12 pb-8 md:pt-14 md:pb-10 bg-white dark:bg-ocean-900 min-h-[calc(88svh-4rem)] lg:min-h-[calc(82svh-4rem)] flex items-center">
          <div className={LP_CONTAINER}>

            <div className="mb-8 text-center max-w-2xl mx-auto">

              <h1 className="font-serif text-5xl text-sage-800 dark:text-white leading-tight mb-4">
                Productivity, in tune with{' '}
                <em className="text-sage-600 dark:text-teal-400 not-italic">how you feel</em>
              </h1>

              <p className="text-lg text-sage-700 dark:text-white/90 leading-relaxed mb-6">
                Balance combines smart task management with mood awareness — helping you stay productive and well, no matter what the day throws at you.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
                <Button href="/auth/signup">
                  Get started free
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  variant="secondary">
                  See how it works
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 text-sm text-sage-700 dark:text-white/90 justify-center">
                {['Free forever', 'GDPR compliant', 'No credit card needed', 'Works on all devices'].map(t => (
                  <span key={t} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-sage-500" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            
          </div>
        </section>



        {/*How it works*/}
        <section id="how-it-works" className="lp-bg-2 py-10 md:py-12 scroll-mt-16">
          <div className={`${LP_CONTAINER} text-center`}>
            <p className="text-sm font-semibold lp-accent uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Three simple steps to better productivity
            </h2>
            <p className="text-sm lp-text-90 max-w-lg mx-auto mb-6 leading-relaxed">
              Balance makes emotion-aware productivity effortless with a simple daily routine
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  step: '01',
                  title: 'Check in with your mood',
                  body: 'Start each session by selecting how you feel right now. Takes just 5 seconds.',
                },
                {
                  step: '02',
                  title: 'Get personalised suggestions',
                  body: 'Balance instantly prioritises tasks that match your current energy and emotional state.',
                },
                {
                  step: '03',
                  title: 'Track your patterns',
                  body: 'See insights about your productivity rhythm and learn what works best for you.',
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="lp-card border lp-border lp-card-shadow p-7">
                  <span className="text-sm font-semibold lp-accent uppercase tracking-widest block mb-4">
                    {step}
                  </span>
                  
                  <h3 className="font-semibold lp-text text-base mb-1">{title}</h3>
                  <p className="text-sm lp-text-60 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*Features */}
        <section id="features" className="lp-bg-1 py-10 md:py-12 scroll-mt-16">
          <div className={`${LP_CONTAINER} text-center`}>
            <p className="text-sm font-semibold lp-accent uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Everything you need to thrive
            </h2>
            <p className="text-sm lp-text-80 max-w-lg mx-auto mb-6 leading-relaxed">
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
                  icon: Sparkles, title: 'AI-powered mood suggestions',
                  body: 'Balance uses AI to generate a personalised suggestion each time you check in — tailored to exactly how you feel.',
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
                  body: 'Your data is stored securely. AI suggestions use only your mood — never your personal details.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title}
                  className="bg-white dark:bg-ocean-700 border lp-border lp-card-shadow p-6
                             hover:border-[var(--lp-accent)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lp-badge-bg)] flex items-center
                                  justify-center mb-4">
                    <Icon size={20} className="lp-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold lp-text text-base mb-1">{title}</h3>
                  <p className="text-sm lp-text-60 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*FAQ  */}
        <section id="faq" className="lp-bg-1 py-10 md:py-12 scroll-mt-16">
          <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-semibold lp-accent uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lp-text mb-3">
              Frequently asked questions
            </h2>
            <p className="text-sm lp-text-80 mb-8">
              Everything you need to know about Balance
            </p>

            <div className="space-y-2 text-left">
              {FAQS.map(({ q, a }, i) => (
                <div key={i}
                  className="bg-white dark:bg-ocean-700 border lp-border rounded-xl overflow-hidden
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
        <div className={`${LP_CONTAINER} py-16`}>
          <div className="grid grid-cols-2 md:grid-cols-[2.5fr_1fr_1fr_1fr] gap-10 mb-12">

            <div className="col-span-2 md:col-span-1">
              <div className="dark"><Logo size="sm" /></div>
              <p className="text-sm text-white/75 mt-2 leading-relaxed">
                Productivity, in tune with how you feel.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/75 uppercase tracking-widest mb-4">
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
              <p className="text-sm font-semibold text-white/75 uppercase tracking-widest mb-4">
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

            <div>
              <p className="text-sm font-semibold text-white/75 uppercase tracking-widest mb-4">
                Contact
              </p>
              <a href="mailto:balancedtasks.mood@gmail.com"
                className="text-sm text-white/75 hover:text-white transition-colors break-all">
                balancedtasks.mood@gmail.com
              </a>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row
                          items-center justify-between gap-4">
            <p className="text-sm text-white/75">
              © 2026 Balance. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/75 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-white/75 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
