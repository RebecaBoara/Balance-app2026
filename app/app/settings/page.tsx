'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile, saveUserProfile } from '@/lib/db'

import {
  signOut, deleteUser, updateProfile,
  EmailAuthProvider, reauthenticateWithCredential,
  GoogleAuthProvider, reauthenticateWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import PageHeader    from '@/components/ui/PageHeader'
import ThemeToggle   from '@/components/ui/Themetoggle'
import Spinner       from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button        from '@/components/ui/Button'
import { useToast }  from '@/components/ui/Toaster'
import {
  LogOut, Trash2, ChevronRight, Check, X, Pencil,
} from 'lucide-react'


function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-white dark:bg-ocean-700 rounded-sm shadow-raised
                    border border-sage-500/15 dark:border-ocean-600 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-sage-500/10 dark:border-ocean-600">
          <p className="text-sm font-semibold text-sage-500 dark:text-white/40 uppercase tracking-widest">
            {title}
          </p>
        </div>
      )}
      <div className="divide-y divide-sage-50 dark:divide-ocean-600">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, description, value, onChange }: {
  label:        string
  description?: string
  value:        boolean
  onChange:     (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm leading-relaxed">
          <span className="font-medium text-sage-800 dark:text-white">{label}</span>
          {description && (
            <span className="text-sage-500 dark:text-white/40"> — {description}</span>
          )}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200
                    ${value ? 'bg-sage-500 dark:bg-teal-600' : 'bg-sage-100 dark:bg-ocean-600'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm
                          transition-transform duration-200
                          ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function LinkRow({ label, description, href, danger = false }: {
  label:   string
  description?: string
  href:    string
  danger?: boolean
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3
                 hover:bg-sage-50 dark:hover:bg-ocean-600
                 transition-colors duration-150 group">
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${danger
          ? 'text-red-500 dark:text-red-400'
          : 'text-sage-700 dark:text-white/80'}`}>
          <span className="font-medium">{label}</span>
          {description && (
            <span className="text-sage-500 dark:text-white/40"> — {description}</span>
          )}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-sage-300 dark:text-white/20
                               group-hover:text-sage-500 transition-colors" aria-hidden="true" />
    </a>
  )
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      aria-label="Copy email address"
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                 transition-colors duration-150
                 bg-sage-50 dark:bg-ocean-600
                 text-sage-600 dark:text-white/70
                 hover:bg-sage-100 dark:hover:bg-ocean-500"
    >
      {copied ? <><Check className="w-3.5 h-3.5" aria-hidden="true" /> Copied!</> : 'Copy'}
    </button>
  )
}

export default function SettingsPage() {
  const { user }   = useAuth()
  const router     = useRouter()
  const { toast }  = useToast()

  const [loading,          setLoading]        = useState(true)
  const [showSignOut,      setShowSignOut]     = useState(false)
  const [showDeleteModal,  setShowDelete]      = useState(false)
  const [deletePassword,   setDeletePass]      = useState('')
  const [deleteError,      setDeleteErr]       = useState('')
  const [deleting,         setDeleting]        = useState(false)
  const [emailReminders,   setEmailReminders]   = useState(true)
  const [reminderTime,     setReminderTime]     = useState('08:00')
  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName,      setEditName]      = useState('')
  const [savingName,    setSavingName]    = useState(false)
  const [nameError,     setNameError]     = useState('')
  // Reminder time editing
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editTime,      setEditTime]      = useState('08:00')
  const [savingTime,    setSavingTime]    = useState(false)

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com') ?? false
  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const profile = await getUserProfile(user!.uid)
        if (profile) {
          setEmailReminders(profile.emailReminders ?? true)
          setReminderTime(profile.reminderTime ?? '08:00')
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleToggleEmailReminders(value: boolean) {
    setEmailReminders(value)
    if (!user) return
    try {
      await saveUserProfile(user.uid, { emailReminders: value })
      toast.success(value ? 'Email reminders enabled' : 'Email reminders disabled')
    } catch (e) {
      console.error(e)
      setEmailReminders(!value)
      toast.error('Could not update email reminders. Please try again.')
    }
  }

  function startEditTime() {
    setEditTime(reminderTime)
    setIsEditingTime(true)
  }

  async function handleSaveTime() {
    if (!user) return
    setSavingTime(true)
    try {
      await saveUserProfile(user.uid, {
        reminderTime: editTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setReminderTime(editTime)
      setIsEditingTime(false)
      toast.success(`Reminder time updated to ${editTime}`)
    } catch (e) {
      console.error(e)
      toast.error('Could not save reminder time. Please try again.')
    } finally {
      setSavingTime(false)
    }
  }

function startEditName() {
    setEditName(user?.displayName || '')
    setNameError('')
    setIsEditingName(true)
  }

  async function handleSaveName() {
    if (!user) return
    const trimmed = editName.trim()
    if (!trimmed) { setNameError('Name cannot be empty.'); return }
    setSavingName(true)
    setNameError('')
    try {
      await updateProfile(user, { displayName: trimmed })
      await saveUserProfile(user.uid, { displayName: trimmed })
      setIsEditingName(false)
      toast.success('Name updated successfully')
    } catch (e) {
      setNameError('Could not save. Please try again.')
      toast.error('Could not update name. Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut(auth)
    window.location.href = '/'
  }

  async function handleDeleteAccount() {
    if (!user || !user.email) return
    setDeleting(true)
    setDeleteErr('')
    try {
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(user, provider)
      } else {
        const credential = EmailAuthProvider.credential(user.email, deletePassword)
        await reauthenticateWithCredential(user, credential)
      }
      await deleteUser(user)
      toast.success('Account deleted. Goodbye!')
      router.push('/')
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteErr('Incorrect password. Please try again.')
        toast.error('Incorrect password. Please try again.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        setDeleteErr('Sign-in window closed. Please try again.')
        toast.error('Sign-in window closed. Please try again.')
      } else {
        setDeleteErr('Something went wrong. Please try again.')
        toast.error('Could not delete account. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }

  function closeDeleteModal() {
    setShowDelete(false)
    setDeletePass('')
    setDeleteErr('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  const displayName = user?.displayName || 'User'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 pb-24">

      <PageHeader title="Settings" />

      <div className="px-6 md:px-0">
        <Card>

          {/* Account */}
          <div className="px-4 py-2.5 bg-warm-50 dark:bg-ocean-800/60">
            <p className="text-xs font-semibold text-sage-500 dark:text-white/40 uppercase tracking-widest">Account</p>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="w-12 h-12 rounded-full bg-sage-500 dark:bg-teal-600
                            flex items-center justify-center
                            text-white text-lg font-semibold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false) }}
                    className="input py-1.5 text-sm mb-1"
                    placeholder="Your name"
                    maxLength={50}
                  />
                  {nameError && <p className="text-xs text-red-500 mb-1">{nameError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={handleSaveName} disabled={savingName} size="sm" className="gap-1 px-3 py-1">
                      {savingName ? <Spinner size="sm" /> : <Check className="w-3 h-3" />}
                      Save
                    </Button>
                    <Button onClick={() => setIsEditingName(false)} variant="secondary" size="sm" className="gap-1 px-3 py-1 text-sage-500 dark:text-white/60">
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-sage-800 dark:text-white truncate">{displayName}</p>
                    <p className="text-sm text-sage-400 dark:text-white/40 truncate">
                      {user?.email}
                      {isGoogleUser && <span className="ml-1 text-sage-400 dark:text-white/30">· Google</span>}
                    </p>
                  </div>
                  <button
                    onClick={startEditName}
                    aria-label="Edit name"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                               text-sage-500 dark:text-white/60 text-xs font-medium
                               hover:text-sage-700 dark:hover:text-white/80
                               hover:bg-sage-50 dark:hover:bg-ocean-600
                               transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="px-4 py-2.5 bg-warm-50 dark:bg-ocean-800/60">
            <p className="text-xs font-semibold text-sage-500 dark:text-white/40 uppercase tracking-widest">Preferences</p>
          </div>
          <ToggleRow
            label="Email reminders"
            description="Daily check-in reminder sent to your email"
            value={emailReminders}
            onChange={handleToggleEmailReminders}
          />
          <div className="px-4 py-3">
            {isEditingTime ? (
              <div>
                <p className="text-sm font-medium text-sage-800 dark:text-white mb-2">Reminder time</p>
                <select
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  className="input text-sm mb-2"
                  autoFocus
                >
                  {Array.from({ length: 17 }, (_, i) => i + 6).map(h => {
                    const value = `${String(h).padStart(2, '0')}:00`
                    const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
                    return <option key={value} value={value}>{label}</option>
                  })}
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTime} disabled={savingTime} size="sm" className="gap-1 px-3 py-1">
                    {savingTime ? <Spinner size="sm" /> : <Check className="w-3 h-3" />}
                    Save
                  </Button>
                  <Button onClick={() => setIsEditingTime(false)} variant="secondary" size="sm" className="gap-1 px-3 py-1 text-sage-500 dark:text-white/60">
                    <X className="w-3 h-3" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium text-sage-800 dark:text-white">Reminder time</span>
                    <span className="text-sage-500 dark:text-white/40"> — Daily check-in notification at {(() => { const h = parseInt(reminderTime); return h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM` })()}</span>
                  </p>
                </div>
                <button
                  onClick={startEditTime}
                  aria-label="Edit reminder time"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                             text-sage-500 dark:text-white/60 text-xs font-medium
                             hover:text-sage-700 dark:hover:text-white/80
                             hover:bg-sage-50 dark:hover:bg-ocean-600
                             transition-colors flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm leading-relaxed">
                  <span className="font-medium text-sage-800 dark:text-white">Theme</span>
                  <span className="text-sage-500 dark:text-white/40"> — Choose how Balance looks across your app experience</span>
                </p>
              </div>
              <div className="flex-shrink-0"><ThemeToggle /></div>
            </div>
          </div>

          {/* Support */}
          <div className="px-4 py-2.5 bg-warm-50 dark:bg-ocean-800/60">
            <p className="text-xs font-semibold text-sage-500 dark:text-white/40 uppercase tracking-widest">Support</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sage-800 dark:text-white">Contact support</p>
              <p className="text-sm text-sage-400 dark:text-white/40 truncate">balancedtasks.mood@gmail.com</p>
            </div>
            <CopyEmailButton email="balancedtasks.mood@gmail.com" />
          </div>

          {/* Privacy & Data */}
          <div className="px-4 py-2.5 bg-warm-50 dark:bg-ocean-800/60">
            <p className="text-xs font-semibold text-sage-500 dark:text-white/40 uppercase tracking-widest">Privacy & Data</p>
          </div>
          <LinkRow label="Privacy Policy" description="See how your data is stored, used, and protected." href="/privacy" />
          <LinkRow label="Terms of Service" description="Review app rules, account responsibilities, and usage terms." href="/terms" />
          <div className="flex items-center px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-sage-700 dark:text-white/80">App version</span>
                <span className="text-sage-500 dark:text-white/40"> — Current installed release used for this research build.</span>
              </p>
            </div>
            <span className="text-sm text-sage-500 dark:text-white/40 flex-shrink-0">1.0.0</span>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 text-left group">
            <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed flex-1">
              <span className="font-medium">Delete account</span>
              <span className="text-red-400/90 dark:text-red-300/80"> — Permanently remove your account and all saved data.</span>
            </p>
            <ChevronRight className="w-4 h-4 text-red-300 dark:text-red-400/40 group-hover:text-red-400 transition-colors flex-shrink-0" aria-hidden="true" />
          </button>
          <button
            onClick={() => setShowSignOut(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 text-left group">
            <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed flex-1">
              <span className="font-medium text-red-500 dark:text-red-400">Sign out</span>
              <span className="text-sage-400 dark:text-white/40"> — Ends your current session on this device.</span>
            </p>
            <ChevronRight className="w-4 h-4 text-sage-300 dark:text-white/20 group-hover:text-sage-400 transition-colors flex-shrink-0" aria-hidden="true" />
          </button>

        </Card>
      </div>

      {/* Sign out confirmation */}
      {showSignOut && (
        <ConfirmDialog
          message="Sign out of Balance?"
          confirmLabel="Sign out"
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOut(false)}
        />
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
            aria-hidden="true" />
          <div className="relative w-full max-w-sm bg-white dark:bg-ocean-800
                          rounded-2xl border border-sage-100 dark:border-ocean-600
                          shadow-lifted animate-fade-in p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id="delete-modal-title"
                  className="font-serif text-xl text-sage-900 dark:text-white">
                  Delete your account
                </h2>
                <p className="text-xs text-sage-400 dark:text-white/40 mt-1">
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                aria-label="Close"
                className="p-1.5 rounded-lg text-sage-400 dark:text-white/50 hover:text-sage-600 dark:hover:text-white
                           hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20
                            border border-red-200 dark:border-red-800 mb-4">
              <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                All your mood entries, tasks, and preferences will be{' '}
                <strong>permanently deleted</strong>. This cannot be recovered.
              </p>
            </div>

            {isGoogleUser ? (
              <p className="text-sm text-sage-600 dark:text-white/60 mb-4 leading-relaxed">
                You signed in with Google. Clicking delete will open a Google sign-in
                window to confirm your identity before deletion.
              </p>
            ) : (
              <div className="mb-4">
                <label htmlFor="delete-password"
                  className="label text-sage-500 dark:text-white/40">
                  Confirm your password
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePass(e.target.value)}
                  placeholder="Enter your password"
                  className="input"
                  autoComplete="current-password"
                />
              </div>
            )}

            {deleteError && (
              <p className="text-xs text-red-500 mb-3">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={closeDeleteModal}
                variant="secondary"
                className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || (!isGoogleUser && !deletePassword)}
                variant="danger"
                className="flex-1 rounded-lg"
              >
                {deleting
                  ? <><Spinner size="sm" /> Deleting...</>
                  : <><Trash2 className="w-4 h-4" aria-hidden="true" /> Delete account</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
