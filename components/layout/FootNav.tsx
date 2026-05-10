'use client'

// Mobile bottom navigation bar
// Shown on screens smaller than md (768px)
// Switches to sidebar on desktop

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Smile, CheckSquare, LayoutDashboard, Settings } from 'lucide-react'
const NAV_ITEMS = [
  { href: '/app/mood',      label: 'Check in',  Icon: Smile },
  { href: '/app/tasks',     label: 'Tasks',     Icon: CheckSquare  },
  { href: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/app/settings',  label: 'Settings',  Icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-warm-100/95 dark:bg-ocean-800/95
                 backdrop-blur-md
                 border-t border-sage-500/15 dark:border-ocean-600
                 flex justify-around items-center
                 px-2 pt-2 pb-4
                 md:hidden"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg
                        transition-all duration-200 min-w-[60px]
                        ${isActive
                          ? 'text-sage-700 dark:text-teal-400'
                          : 'text-sage-500 dark:text-white/60 hover:text-sage-600 dark:hover:text-white/80'
                        }`}
          >
            <Icon
              size={20}
              aria-hidden="true"
              className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}
            />
            <span className={`text-xs font-medium
                              ${isActive ? 'font-semibold' : ''}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}