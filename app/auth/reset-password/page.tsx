'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AuthLayout from '@/components/layout/AuthLayout'
import Spinner from '@/components/ui/Spinner'
import { ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('No account found with that email address.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>

          <Link href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-sage-500
                       dark:text-white/70 hover:text-sage-700 transition-colors mb-8">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to sign in
          </Link>

          {sent ? (
            <div className="text-center">
             
              <h1 className="font-serif text-2xl text-sage-900 dark:text-white mb-3">
                Check your inbox
              </h1>
              <p className="text-sm text-sage-500 dark:text-white/70 leading-relaxed mb-6">
                We've sent a password reset link to <strong className="text-sage-700 dark:text-white">{email}</strong>.
                Check your spam folder if it doesn't arrive within a few minutes.
              </p>
              <Link href="/auth/login"
                className="btn-primary inline-block px-6">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-sage-900 dark:text-white mb-2">
                  Reset your password
                </h1>
                <p className="text-sm text-sage-500 dark:text-white/70">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-sm bg-coral-pale dark:bg-coral-app/20
                                border border-coral-app/30 text-red-800 dark:text-coral-pale
                                text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label text-sage-500 dark:text-white/70">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      Sending...
                    </>
                  ) : 'Send reset link'}
                </button>
              </form>
            </>
          )}

    </AuthLayout>
  )
}
