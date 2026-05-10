'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight, ArrowLeft, FileText } from 'lucide-react'

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

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-sage-500 dark:text-teal-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-4xl text-sage-900 dark:text-white mb-1">Terms of Service</h1>
            <p className="text-sm text-sage-400 dark:text-ocean-300">Last updated: April 2026 · Balance — Productivity & Wellbeing</p>
          </div>
        </div>

        {/* Intro banner */}
        <div className="p-4 rounded-xl bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-700 mb-10">
          <p className="text-sm text-sage-700 dark:text-sage-300 leading-relaxed">
            Please read these terms carefully before using Balance. By creating an account you agree to these terms. Balance is an academic research prototype — these terms reflect its nature as a university dissertation project.
          </p>
        </div>

        <div className="space-y-8 text-sm text-sage-600 dark:text-ocean-300 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">1. About Balance</h2>
            <p>Balance is a web-based emotion-aware productivity planner developed as the primary artefact for a dissertation project at Southampton Solent University (Academic Year 2025–26). It is a research prototype, not a commercial product.</p>
            <p className="mt-3">The application is provided free of charge for the purpose of academic research and usability evaluation. Its primary goal is to investigate whether emotion-aware task recommendations can improve digital productivity and wellbeing.</p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">2. Using the app</h2>
            <p className="mb-3">By using Balance, you agree to:</p>
            <ul className="space-y-2 ml-4">
              {[
                'Provide accurate information when creating your account',
                'Use the application for personal productivity purposes only',
                'Not attempt to access other users\' data or circumvent security measures',
                'Not use the application for any unlawful or harmful purpose',
                'Be at least 16 years old (GDPR age of digital consent in the UK)',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-sage-400 mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">3. Your content</h2>
            <p>You retain ownership of all content you create in Balance — your tasks, mood entries, and notes are yours. By using Balance, you grant us a limited licence to store and process this content solely to provide the application's functionality.</p>
            <p className="mt-3">Anonymised and aggregated data (with no personally identifiable information) may be used in the dissertation research findings. Individual user data will never be identified or disclosed in research outputs.</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">4. Research participation</h2>
            <p className="mb-3">Some users may be invited to participate in usability testing as part of the dissertation evaluation. Participation is entirely voluntary. If you participate:</p>
            <ul className="space-y-2 ml-4">
              {[
                'You will be informed of the purpose before the session begins',
                'You can withdraw at any time without consequence',
                'Any feedback provided will be anonymised in research reporting',
                'Ethical clearance has been obtained from Southampton Solent University',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-sage-400 mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 5 — Disclaimer in amber box */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">5. Disclaimer of warranties</h2>
            <div className="p-4 rounded-xl bg-amber-pale dark:bg-amber-900/20 border border-amber-app/40 mb-3">
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                Balance is provided <strong>"as is"</strong> without any warranties, express or implied. As an academic prototype, we do not guarantee uninterrupted availability, data accuracy, or any particular purpose beyond the scope of the dissertation research.
              </p>
            </div>
            <p>The emotion-aware task recommendations provided by Balance are based on a simplified model and should not be taken as professional mental health, medical, or productivity advice. If you are experiencing significant mental health difficulties, please seek support from a qualified professional.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">6. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Balance and its developer (Rebeca Boara, Southampton Solent University) shall not be liable for any indirect, incidental, or consequential damages arising from your use of the application. Our total liability shall not exceed the amount you have paid for the service — which is zero, as Balance is free.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">7. Account termination</h2>
            <p>You can delete your account at any time from the Settings screen. Upon deletion, all your data (mood entries, tasks, preferences) will be permanently and irreversibly removed from our systems.</p>
            <p className="mt-3">We reserve the right to suspend accounts that violate these terms. The Balance application may be decommissioned following the conclusion of the dissertation research period, at which point all user data will be securely deleted.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">8. Changes to these terms</h2>
            <p>As this is an academic prototype with a fixed research timeline, significant changes to these terms are unlikely. Any changes will be reflected in the "Last updated" date at the top of this page. Continued use of Balance after changes constitutes acceptance of the updated terms.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">9. Governing law</h2>
            <p>These terms are governed by the laws of England and Wales. Any disputes arising from the use of Balance shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">10. Contact</h2>
            <div className="p-5 rounded-xl bg-warm-100 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600">
              <p className="mb-3">If you have questions about these terms, please contact:</p>
              <div className="space-y-1">
                
                <p><span className="font-semibold text-sage-800 dark:text-white">Email:</span> rebeca.boara@gmail.com</p>
               
              </div>
            </div>
          </section>

        </div>

        {/* Also see privacy */}
        <div className="mt-10 p-5 rounded-xl bg-warm-100 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sage-700 dark:text-white">Also read our Privacy Policy</p>
            <p className="text-xs text-sage-500 dark:text-ocean-300 mt-0.5">Learn how we handle your data and your GDPR rights</p>
          </div>
          <Link href="/privacy" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-sage-200 dark:border-ocean-600 text-sage-600 dark:text-ocean-200 text-sm font-medium hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors flex-shrink-0">
            Privacy Policy <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}