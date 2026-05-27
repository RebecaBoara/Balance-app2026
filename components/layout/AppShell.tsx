'use client'

import Sidebar  from './Sidebar'
import BottomNav from './FootNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900">

      {/* Sidebar — visible md and above */}
      <Sidebar />

      {/* Main content area */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-8 max-w-8xl md:px-10 md:py-6">
        {children}
      </main>

      {/* Bottom nav — visible below md */}
      <BottomNav />

    </div>
  )
}
