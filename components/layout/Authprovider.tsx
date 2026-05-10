'use client'

// Wraps all /app/* screens
// Checks Firebase auth state client-side
// Shows loading spinner while checking
// Redirects to login if not authenticated


import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  // Loading state 
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-script text-4xl text-sage-500 dark:text-teal-400">
            Balance
          </span>
          <Spinner size="md" />
        </div>
      </div>
    )
  }

  // Not authenticated 
  if (!user) {
    return null // redirect handled by useEffect above
  }

  // Authenticated
  return <>{children}</>
}