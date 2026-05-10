'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, ArrowLeft, Shield } from 'lucide-react'

const SAGE_GRADIENT = 'linear-gradient(135deg, #3D5248 0%, #4C6659 50%, #536E60 100%)'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: SAGE_GRADIENT }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-script text-2xl text-white leading-none">
          Balance
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/auth/signup"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all duration-200">
            Get started <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-6 py-3 space-y-1"
          style={{ background: SAGE_GRADIENT }}>
          <Link href="/" className="block text-sm text-white/80 py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/auth/signup" className="block text-center px-5 py-2.5 rounded-lg bg-white/20 text-white text-sm font-medium mt-1" onClick={() => setMenuOpen(false)}>Get started free</Link>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="mt-16" style={{ backgroundColor: '#3D5248' }}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="font-script text-xl text-white">Balance</span>
          <p className="text-xs text-white/55">© 2026 Balance — Rebeca Boara. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="text-xs text-white/70 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const SECTIONS = [
  {
    title: '1. What data we collect',
    content: null,
    cards: [
      { title: 'Account information', text: 'When you register, we collect your email address and display name. If you use Google sign-in, we receive your Google account name and email address.' },
      { title: 'Mood check-ins', text: 'We store your daily mood selections (Exhausted, Stressed, Neutral, Good, Energised), any optional notes you add, and the date of each check-in.' },
      { title: 'Tasks', text: 'We store your task titles, difficulty levels, estimated completion times, optional due dates, optional notes, and completion status.' },
      { title: 'App preferences', text: 'We store your settings including theme preference, reminder time, and notification preferences. Theme is also stored in your browser\'s localStorage.' },
    ],
  },
  {
    title: '2. What we do NOT collect',
    content: 'We do not collect any of the following:',
    bullets: ['Location data or GPS coordinates', 'Biometric data or facial recognition', 'Device identifiers or browser fingerprinting', 'Browsing history or tracking cookies', 'Any data from third-party sources'],
  },
  {
    title: '3. How we use your data',
    content: 'Your data is used solely to provide the Balance application\'s functionality. Mood data powers the emotion-aware task recommendation algorithm. Task data populates your task list and completion tracking. Combined mood and task data generates your dashboard insights. Anonymised usage data may be reviewed by authorised administrators for research and service improvement purposes. We do not use your data for advertising, profiling, or any commercial purpose.',
  },
  {
    title: '4. How we store your data',
    content: 'All data is stored in Firebase Firestore, a cloud database provided by Google. The Firebase project is configured to use the europe-west2 (London) region, keeping your data within the United Kingdom and European Union. Data is encrypted at rest and in transit by default. Firestore Security Rules ensure no user can read or write another user\'s data. Authorised administrators have read-only access to aggregated participant data for service operation and research purposes.',
  },
  {
    title: '5. Data retention',
    content: 'Your data is retained for as long as your account is active. If you delete your account, all associated mood entries, tasks, and preferences are permanently and irreversibly deleted. The application will be decommissioned following the conclusion of the dissertation research period.',
  },
  {
    title: '6. Third-party services',
    content: 'Balance uses the following third-party services: Firebase (Google) for authentication and database storage, Vercel for application hosting, and Google Fonts for typography. Each provider is subject to their own privacy policies. No user data is shared beyond what is technically necessary to operate the service.',
  },
  {
    title: '7. Cookies',
    content: 'Balance uses minimal cookies. Firebase Authentication uses a session cookie to maintain your login state. We do not use advertising cookies, tracking cookies, or analytics cookies. You can clear cookies at any time through your browser settings, though this will sign you out of the application.',
  },
  {
    title: '8. Contact',
    content: null,
    contact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-ocean-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-12">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-sage-500 hover:text-sage-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to home
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-sage-500 dark:text-teal-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-4xl text-sage-900 dark:text-white mb-1">Privacy Policy</h1>
            <p className="text-sm text-sage-400 dark:text-ocean-300">Last updated: May 2026 · Balance — Productivity & Wellbeing</p>
          </div>
        </div>

        {/* Intro banner */}
        <div className="p-4 rounded-xl bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-700 mb-10">
          <p className="text-sm text-sage-700 dark:text-sage-300 leading-relaxed">
            Balance is an academic research prototype developed as part of a dissertation project at Southampton Solent University. This policy explains what data we collect, how we use it, and your rights under the General Data Protection Regulation (GDPR).
          </p>
        </div>

        {/* GDPR rights grid */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-4">Your GDPR rights</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { right: 'Right of access',         desc: 'Request a copy of all data we hold about you.' },
              { right: 'Right to erasure',         desc: 'Delete your account and all data at any time from Settings.' },
              { right: 'Right to rectification',   desc: 'Update your profile information at any time.' },
              { right: 'Right to portability',     desc: 'Request an export of your data in machine-readable format.' },
              { right: 'Right to withdraw',        desc: 'Stop using Balance and delete your account at any time.' },
              { right: 'Right to object',          desc: 'Object to how your data is processed by contacting us.' },
            ].map(({ right, desc }) => (
              <div key={right} className="p-4 rounded-xl bg-warm-100 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600">
                <h3 className="text-xs font-semibold text-sage-600 dark:text-teal-400 uppercase tracking-wider mb-1">{right}</h3>
                <p className="text-xs text-sage-500 dark:text-ocean-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map(({ title, content, cards, bullets, contact }) => (
            <section key={title}>
              <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">{title}</h2>

              {content && (
                <p className="text-sm text-sage-600 dark:text-ocean-300 leading-relaxed mb-3">{content}</p>
              )}

              {bullets && (
                <ul className="space-y-2">
                  {bullets.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-sage-600 dark:text-ocean-300">
                      <span className="text-coral-app mt-0.5 flex-shrink-0">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {cards && (
                <div className="space-y-3">
                  {cards.map(({ title: ct, text }) => (
                    <div key={ct} className="p-4 rounded-xl bg-warm-100 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600">
                      <h3 className="text-sm font-semibold text-sage-800 dark:text-white mb-1">{ct}</h3>
                      <p className="text-sm text-sage-500 dark:text-ocean-300 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              )}

              {contact && (
                <div className="p-5 rounded-xl bg-warm-100 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600">
                  <p className="text-sm text-sage-600 dark:text-ocean-300 leading-relaxed mb-3">
                    If you have any questions about this privacy policy or how your data is handled, please contact:
                  </p>
                  <div className="space-y-1 text-sm">
                    
                    <p><span className="font-semibold text-sage-800 dark:text-white">Email:</span> <span className="text-sage-600 dark:text-ocean-300">rebeca.boara@gmail.com</span></p>
                    
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

       
        {/* Also see terms */}
        <div className="mt-4 text-center">
          <Link href="/terms" className="text-sm text-sage-400 hover:text-sage-600 dark:hover:text-ocean-200 transition-colors">
            Also read our Terms of Service →
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}