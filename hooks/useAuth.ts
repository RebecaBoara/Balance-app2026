
'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(auth.currentUser)
  const [loading, setLoading] = useState(auth.currentUser === null)

  useEffect(() => {
    // Fallback: if Firebase hasn't resolved in 5s, unblock the UI
    const timeout = setTimeout(() => setLoading(false), 5000)

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeout)
      setUser(u)
      setLoading(false)
    })

    return () => { unsubscribe(); clearTimeout(timeout) }
  }, [])

  return { user, loading }
}