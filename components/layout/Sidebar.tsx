'use client'

// Desktop and tablet sidebar navigation
// Hidden on mobile — shown from md (768px) upwards

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ThemeToggle from '@/components/ui/Themetoggle'
import Logo from '@/components/ui/Logo'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Smile, CheckSquare, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/app/mood',      label: 'Check in',  Icon: Smile},
  { href: '/app/tasks',     label: 'Tasks',     Icon: CheckSquare},
  { href: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/app/settings',  label: 'Settings',  Icon: Settings },
]

export default function Sidebar() {
  const pathname  = usePathname()
const [confirmSignOut, setConfirmSignOut] = useState(false)

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    await signOut(auth)
    window.location.href = '/'
  }

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden md:flex flex-col
                 w-64 min-h-screen fixed left-0 top-0
                 bg-white dark:bg-ocean-800
                 border-r border-sage-500/15 dark:border-ocean-600
                 px-4 py-6 z-40"
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <Logo size="md" />
        
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, Icon}) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-md
                          transition-all duration-200 group
                          ${isActive
                            ? 'bg-sage-50 dark:bg-sage-900/30 border-l-2 border-sage-500 dark:border-teal-400 lp-card-shadow animate-fade-in'
                            : 'hover:bg-warm-100 dark:hover:bg-ocean-700 border-l-2 border-transparent'
                          }`}
            >
              <Icon size={20} aria-hidden="true" className="w-6 flex-shrink-0" />
              <p className={`text-sm font-medium transition-colors
                             ${isActive
                               ? 'text-sage-900 dark:text-teal-400'
                               : 'text-sage-900 dark:text-white/80 group-hover:text-sage-700'
                             }`}>
                {label}
              </p>
            </Link>
          )
        })}
      </nav>

      

        {/* Sign out */}
        <button
          onClick={() => setConfirmSignOut(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                     text-sage-700 dark:text-white/80 text-sm
                     hover:bg-coral-pale dark:hover:bg-coral-app/20
                     hover:text-coral-app dark:hover:text-coral-pale
                     transition-all duration-200"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
    

      {confirmSignOut && (
        <ConfirmDialog
          message="Sign out of Balance?"
          confirmLabel="Sign out"
          onConfirm={handleSignOut}
          onCancel={() => setConfirmSignOut(false)}
        />
      )}
    </aside>
  )
}
