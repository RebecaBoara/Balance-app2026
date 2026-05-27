'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { createUserProfile, getUserProfile } from '@/lib/db'
import Spinner from '@/components/ui/Spinner'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'
export default function SignupPage() {
  const router = useRouter()
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [agreed,    setAgreed]    = useState(false)

  // Password strength — mirrors Firebase password policy
  function getPasswordStrength(pwd: string): {
    score: number
    label: string
    colour: string
  } {
    if (pwd.length === 0) return { score: 0, label: '',           colour: '' }
    if (pwd.length < 8)   return { score: 1, label: 'Too short',  colour: 'bg-coral-app' }
    const hasUpper  = /[A-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
    const met = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length
    if (met === 3)        return { score: 4, label: 'Strong',     colour: 'bg-sage-500' }
    if (met === 2)        return { score: 3, label: 'Good',       colour: 'bg-sage-300' }
    return                       { score: 2, label: 'Weak',       colour: 'bg-amber-app' }
  }

  const strength = getPasswordStrength(password)

  //Email / password sign up 
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      await updateProfile(cred.user, { displayName: name })
      await createUserProfile(cred.user.uid, cred.user.email!, name)
      const idToken = await cred.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      router.push('/onboarding')
    } catch (err: any) {
      console.error('[Auth] Signup failed:', err.code, err.message)
      setError(getFriendlyError(err.code))
    } finally {
      setLoading(false)
    }

  }

  //  Google sign up 
  async function handleGoogleSignup() {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await createUserProfile(cred.user.uid, cred.user.email!, cred.user.displayName || undefined)
      const idToken = await cred.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const profile = await getUserProfile(cred.user.uid)
      router.push(profile?.hasOnboarded ? '/app/mood' : '/onboarding')
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') return
      setError(getFriendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  // Friendly error messages
  function getFriendlyError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists.'
      case 'auth/account-exists-with-different-credential': return 'This email is already registered with a different sign-in method. Try logging in with Google or reset your password.'
      case 'auth/popup-blocked': return 'Popup was blocked by your browser. Please allow popups and try again.'
      case 'auth/invalid-email':        return 'Please enter a valid email address.'
      case 'auth/weak-password':
      case 'auth/password-does-not-meet-requirements':
        return 'Password must be at least 8 characters and include an uppercase letter, a number, and a symbol.'
      default:                          return 'Something went wrong. Please try again.'
    }
  }

  return (
    <AuthLayout>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-sage-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-sm text-sage-500 dark:text-white/70">
              Start your journey to balanced productivity
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-sm bg-coral-pale dark:bg-coral-app/20
                            border border-coral-app/30 text-red-800 dark:text-coral-pale
                            text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">

            {/* Name */}
            <div>
              <label className="label text-sage-500 dark:text-white/70">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                required
                autoComplete="given-name"
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label text-sage-500 dark:text-white/70">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoComplete="email"
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label text-sage-500 dark:text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400
                             hover:text-sage-600 dark:text-white/70 transition-colors text-sm"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strength.colour
                            : 'bg-sage-100 dark:bg-ocean-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-sage-400 dark:text-white/70">
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="label text-sage-500 dark:text-white/70">
                Confirm password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className={`input ${
                  confirm.length > 0 && confirm !== password
                    ? 'border-coral-app'
                    : confirm.length > 0 && confirm === password
                    ? 'border-sage-400'
                    : ''
                }`}
              />
              {confirm.length > 0 && confirm !== password && (
                <p className="text-xs text-coral-app mt-1">Passwords do not match</p>
              )}
              {confirm.length > 0 && confirm === password && (
                <p className="text-xs text-sage-500 mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-sage-500 flex-shrink-0 cursor-pointer"
              />
              <span className="text-xs text-sage-500 dark:text-white/70 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="underline hover:text-sage-700 dark:hover:text-white">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="underline hover:text-sage-700 dark:hover:text-white">
                  Privacy Policy
                </Link>
                . I understand my mood data is private and never shared.
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !agreed}
              fullWidth
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Creating account...
                </>
              ) : 'Create account'}
            </Button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-sage-100 dark:bg-ocean-600" />
            <span className="text-xs text-sage-400 dark:text-white/70">or</span>
            <div className="flex-1 h-px bg-sage-100 dark:bg-ocean-600" />
          </div>

          {/* Google */}
          <Button
            onClick={handleGoogleSignup}
            variant="secondary"
            disabled={loading}
            fullWidth
            className="gap-3 text-sage-700 dark:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Sign in link */}
          <p className="text-center text-sm text-sage-500 dark:text-white/70 mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-sage-600 dark:text-teal-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

    </AuthLayout>
  )
}
