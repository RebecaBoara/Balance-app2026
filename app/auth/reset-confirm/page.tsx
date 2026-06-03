'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AuthLayout from '@/components/layout/AuthLayout'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function ResetConfirmForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const oobCode      = searchParams.get('oobCode') ?? ''

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [verifying,  setVerifying]  = useState(true)
  const [invalidCode,setInvalidCode]= useState(false)
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!oobCode) { setInvalidCode(true); setVerifying(false); return }
    verifyPasswordResetCode(auth, oobCode)
      .then(e  => { setEmail(e); setVerifying(false) })
      .catch(() => { setInvalidCode(true); setVerifying(false) })
  }, [oobCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err: any) {
      if      (err.code === 'auth/weak-password')        setError('Password must be at least 6 characters.')
      else if (err.code === 'auth/expired-action-code')  setError('This link has expired. Please request a new one.')
      else                                               setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return <Spinner size="md" />
  }

  if (invalidCode) {
    return (
      <div className="text-center">
        <h1 className="font-serif font-bold text-2xl text-sage-900 dark:text-white mb-3">Link expired</h1>
        <p className="text-sm text-sage-700 dark:text-white/70 mb-6 leading-relaxed">
          This password reset link has expired or already been used. Please request a new one.
        </p>
        <Button href="/auth/reset-password" className="px-6">
          Request new link
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 text-sage-500 dark:text-teal-400 mx-auto mb-4" />
        <h1 className="font-serif font-bold text-2xl text-sage-900 dark:text-white mb-3">Password updated</h1>
        <p className="text-sm text-sage-700 dark:text-white/70 mb-6">
          Your password has been reset. Redirecting you to sign in…
        </p>
        <Button href="/auth/login" className="px-6">
          Sign in now
        </Button>
      </div>
    )
  }

  return (
    <div>

        <Link href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-sage-500
                     dark:text-white/70 hover:text-sage-700 transition-colors mb-8">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to sign in
        </Link>

        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl text-sage-900 dark:text-white mb-2">
            Set new password
          </h1>
          <p className="text-sm text-sage-700 dark:text-white/70">
            Resetting password for{' '}
            <strong className="text-sage-700 dark:text-white">{email}</strong>
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
            <label className="label text-sage-700 dark:text-white/70">New password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                className="input pr-10"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-sage-600 dark:text-white/70 hover:text-sage-800 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label text-sage-700 dark:text-white/70">Confirm password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              required
              autoComplete="new-password"
              className="input"
            />
          </div>

          <Button type="submit" disabled={loading} fullWidth className="mt-2">
            {loading ? <><Spinner size="sm" /> Updating…</> : 'Set new password'}
          </Button>
        </form>

    </div>
  )
}

export default function ResetConfirmPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<Spinner size="md" />}>
        <ResetConfirmForm />
      </Suspense>
    </AuthLayout>
  )
}
