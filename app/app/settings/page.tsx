'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile, saveUserProfile } from '@/lib/db'
import { useTheme } from '@/components/layout/ThemeProvider'
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
import {
  Coffee, Shield, LogOut, Trash2, ChevronRight, Check, X, Info, Pencil, Mail,
} from 'lucide-react'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-sage-500 dark:text-white/40
                  uppercase tracking-widest px-1 mb-2 mt-4 first:mt-0">
      {children}
    </p>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-ocean-700 rounded-sm shadow-raised
                    border border-sage-500/15 dark:border-ocean-600
                    divide-y divide-sage-50 dark:divide-ocean-600 overflow-hidden">
      {children}
    </div>
  )
}

function ToggleRow({ label, description, icon: Icon, value, onChange }: {
  label:        string
  description?: string
  icon:         React.ElementType
  value:        boolean
  onChange:     (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        <div className="w-8 h-8 rounded-lg bg-sage-50 dark:bg-ocean-600
                        flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-sage-500 dark:text-teal-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm leading-relaxed">
            <span className="font-medium text-sage-800 dark:text-white">{label}</span>
            {description && (
              <span className="text-sage-400 dark:text-white/40"> — {description}</span>
            )}
          </p>
        </div>
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

function LinkRow({ label, description, icon: Icon, href, danger = false }: {
  label:   string
  description?: string
  icon:    React.ElementType
  href:    string
  danger?: boolean
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3
                 hover:bg-sage-50 dark:hover:bg-ocean-600
                 transition-colors duration-150 group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                       ${danger
                         ? 'bg-red-50 dark:bg-red-900/20'
                         : 'bg-sage-50 dark:bg-ocean-600'
                       }`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-sage-500 dark:text-teal-400'}`}
          aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${danger
          ? 'text-red-500 dark:text-red-400'
          : 'text-sage-700 dark:text-white/80'}`}>
          <span className="font-medium">{label}</span>
          {description && (
            <span className="text-sage-400 dark:text-white/40"> — {description}</span>
          )}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-sage-300 dark:text-white/20
                               group-hover:text-sage-500 transition-colors" aria-hidden="true" />
    </a>
  )
}

export default function SettingsPage() {
  const { user }   = useAuth()
  const { theme }  = useTheme()
  const router     = useRouter()

  const [loading,          setLoading]        = useState(true)
  const [saving,           setSaving]         = useState(false)
  const [saved,            setSaved]          = useState(false)
  const [showSignOut,      setShowSignOut]     = useState(false)
  const [showDeleteModal,  setShowDelete]      = useState(false)
  const [deletePassword,   setDeletePass]      = useState('')
  const [deleteError,      setDeleteErr]       = useState('')
  const [deleting,         setDeleting]        = useState(false)
  const [breakSuggestions, setBreakSuggestions] = useState(true)

  // Profile editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName,      setEditName]      = useState('')
  const [savingName,    setSavingName]    = useState(false)
  const [nameError,     setNameError]     = useState('')

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com') ?? false

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const profile = await getUserProfile(user!.uid)
        if (profile) {
          setBreakSuggestions(profile.breakSuggestions ?? true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await saveUserProfile(user.uid, { breakSuggestions, theme })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
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
    } catch (e) {
      setNameError('Could not save. Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  async function handleSignOut() {
    await signOut(auth)
    router.push('/')
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
      router.push('/')
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteErr('Incorrect password. Please try again.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        setDeleteErr('Sign-in window closed. Please try again.')
      } else {
        setDeleteErr('Something went wrong. Please try again.')
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

        {/* Profile */}
        <Card>
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
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="flex items-center gap-1 px-3 py-1 rounded-md
                                 bg-sage-500 text-white text-xs font-medium
                                 hover:bg-sage-700 disabled:opacity-60 transition-colors">
                      {savingName ? <Spinner size="sm" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="flex items-center gap-1 px-3 py-1 rounded-md
                                 border border-sage-200 dark:border-ocean-500
                                 text-sage-500 dark:text-white/60 text-xs
                                 hover:bg-sage-50 dark:hover:bg-ocean-600 transition-colors">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-sage-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-sage-400 dark:text-white/40 truncate">
                      {user?.email}
                      {isGoogleUser && <span className="ml-1 text-white/30">· Google</span>}
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
        </Card>

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <Card>
          <ToggleRow
            label="Break suggestions"
            description="Suggests short breaks when you're exhausted or stressed"
            icon={Coffee}
            value={breakSuggestions}
            onChange={setBreakSuggestions}
          />
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-8 h-8 rounded-lg bg-sage-50 dark:bg-ocean-600
                              flex items-center justify-center flex-shrink-0">
                <span className="text-sm" aria-hidden="true">☀️</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed">
                  <span className="font-medium text-sage-800 dark:text-white">Theme</span>
                  <span className="text-sage-400 dark:text-white/40"> — Choose how Balance looks across your app experience</span>
                </p>
              </div>
              </div>
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 mt-3
                     py-3 rounded-xl bg-sage-500 dark:bg-teal-600
                     text-white font-medium text-sm
                     hover:bg-sage-700 dark:hover:bg-teal-700
                     transition-all duration-200 disabled:opacity-60"
        >
          {saving ? (
            <><Spinner size="sm" /> Saving...</>
          ) : saved ? (
            <><Check className="w-4 h-4" aria-hidden="true" /> Saved!</>
          ) : (
            'Save preferences'
          )}
        </button>

        {/* Privacy & Data */}
        <SectionLabel>Privacy & Data</SectionLabel>
        <Card>
          <LinkRow
            label="Privacy Policy"
            description="See how your data is stored, used, and protected."
            icon={Shield}
            href="/privacy"
          />
          <LinkRow
            label="Terms of Service"
            description="Review app rules, account responsibilities, and usage terms."
            icon={Shield}
            href="/terms"
          />
          <button
            onClick={() => setShowDelete(true)}
            className="w-full flex items-center gap-3 px-4 py-3
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors duration-150 group text-left">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20
                            flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-red-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed">
                <span className="font-medium">Delete account</span>
                <span className="text-red-400/90 dark:text-red-300/80"> — Permanently remove your account and all saved data.</span>
              </p>
            </div>
          </button>
        </Card>

        {/* Support */}
        <SectionLabel>Support</SectionLabel>
        <Card>
          <LinkRow
            label="Contact support"
            description="Get help or send feedback"
            icon={Mail}
            href="mailto:balancedtasks.mood@gmail.com"
          />
        </Card>

        {/* About */}
        <SectionLabel>About</SectionLabel>
        <Card>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-sage-50 dark:bg-ocean-600
                            flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-sage-500 dark:text-teal-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-sage-700 dark:text-white/80">App version</span>
                <span className="text-sage-400 dark:text-white/40"> — Current installed release used for this research build.</span>
              </p>
            </div>
            <span className="text-sm text-sage-400 dark:text-white/40 flex-shrink-0">1.0.0</span>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="font-script text-lg text-sage-400 dark:text-white/30">Balance</p>
            <p className="text-xs text-sage-300 dark:text-white/20 mt-0.5">
              Southampton Solent University · Rebeca Boara
            </p>
          </div>
        </Card>

        {/* Sign out */}
        <button
          onClick={() => setShowSignOut(true)}
          className="w-full flex items-center justify-center gap-2 mt-5
                     py-3 rounded-xl border border-coral-app dark:border-red-500/60
                     text-coral-app dark:text-red-400 text-sm font-medium
                     hover:bg-red-50 dark:hover:bg-red-900/10
                     transition-all duration-200"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign out
        </button>
        <p className="text-xs text-sage-400 dark:text-white/40 mt-2 px-1">
          Ends your current session on this device.
        </p>

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
              <button
                onClick={closeDeleteModal}
                className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || (!isGoogleUser && !deletePassword)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           rounded-lg bg-red-500 text-white text-sm font-medium
                           hover:bg-red-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {deleting
                  ? <><Spinner size="sm" /> Deleting...</>
                  : <><Trash2 className="w-4 h-4" aria-hidden="true" /> Delete account</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
