'use client'

import Sidebar  from './Sidebar'
import BottomNav from './FootNav'
import Logo     from '@/components/ui/Logo'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900">

      {/* Sidebar — visible md and above */}
      <Sidebar />

      {/* Mobile top bar — logo links back to landing */}
      <div className="md:hidden sticky top-0 z-40 flex items-center px-6 h-14
                      bg-white dark:bg-ocean-800
                      border-b border-sage-500/15 dark:border-ocean-600">
        <Logo size="sm" />
      </div>

      {/* Main content area */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-8 max-w-8xl md:px-10 md:py-6">
        {children}
      </main>

      {/* Bottom nav — visible below md */}
      <BottomNav />

    </div>
  )
}
