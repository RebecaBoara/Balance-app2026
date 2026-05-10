'use client'

// Handles light,dark and system theme
// Persists choice to localStorage
// Adds or removes 'dark' class on <html> for Tailwind styling

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme:     Theme
  setTheme:  (theme: Theme) => void
  isDark:    boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme:    'system',
  setTheme: () => {},
  isDark:   false,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme,  setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark]     = useState(false)

  // On mount: read saved preference 
  useEffect(() => {
    const saved = localStorage.getItem('balance-theme') as Theme | null
    if (saved) {
      setThemeState(saved)
    }
  }, [])

  // Apply theme whenever it changes 
  useEffect(() => {
    const root        = document.documentElement
    const systemDark  = window.matchMedia('(prefers-color-scheme: dark)').matches

    let dark = false

    if (theme === 'dark')   dark = true
    if (theme === 'light')  dark = false
    if (theme === 'system') dark = systemDark

    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    setIsDark(dark)
  }, [theme])

  // Listen for system preference changes 
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(e: MediaQueryListEvent) {
      document.documentElement.classList.toggle('dark', e.matches)
      setIsDark(e.matches)
    }

    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [theme])

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
    localStorage.setItem('balance-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}