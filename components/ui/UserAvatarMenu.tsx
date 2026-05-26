'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, LogOut, ShieldCheck } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile } from '@/lib/db'

export default function UserAvatarMenu() {
  const { user }              = useAuth()
const [open, setOpen]       = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const dropdownRef           = useRef<HTMLDivElement>(null)

  const firstName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? '?'
  const initial   = firstName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!user) return
    getUserProfile(user.uid).then(p => setIsAdmin(p?.isAdmin === true))
  }, [user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut(auth)
    window.location.href = '/'
  }

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-sage-500 dark:bg-teal-600
                   flex items-center justify-center text-white font-semibold text-sm
                   hover:bg-sage-600 dark:hover:bg-teal-500 transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md shadow-raised
                        bg-white dark:bg-ocean-800
                        border border-sage-100 dark:border-ocean-600
                        py-1 z-50 animate-[fadeIn_0.15s_ease]">
          <p className="px-3 py-2 text-xs text-sage-600 dark:text-white/40 truncate border-b border-sage-100 dark:border-ocean-700">
            {user?.displayName ?? user?.email}
          </p>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm
                         text-sage-700 dark:text-white/80
                         hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Admin
            </Link>
          )}
          <Link
            href="/app/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm
                       text-sage-700 dark:text-white/80
                       hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                       text-red-600 dark:text-coral-pale
                       hover:bg-red-50 dark:hover:bg-coral-app/10 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
