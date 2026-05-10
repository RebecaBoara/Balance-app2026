'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

interface ToastItem {
  id:      string
  message: string
  type:    'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: {
    success: (msg: string) => void
    error:   (msg: string) => void
    info:    (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((message: string, type: ToastItem['type']) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => dismiss(id), 3500)
  }, [dismiss])

  const toast = {
    success: (msg: string) => add(msg, 'success'),
    error:   (msg: string) => add(msg, 'error'),
    info:    (msg: string) => add(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-md shadow-raised
                        pointer-events-auto animate-[fadeIn_0.2s_ease]
                        border text-sm font-medium min-w-[260px] max-w-sm
                        bg-white dark:bg-ocean-800
                        ${t.type === 'success' ? 'border-sage-200   dark:border-teal-600/40' : ''}
                        ${t.type === 'error'   ? 'border-red-200    dark:border-coral-app/40' : ''}
                        ${t.type === 'info'    ? 'border-sage-100   dark:border-ocean-600' : ''}
                       `}>
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-sage-500 dark:text-teal-400 flex-shrink-0" />}
            {t.type === 'error'   && <XCircle      className="w-4 h-4 text-red-500 dark:text-coral-pale flex-shrink-0" />}
            {t.type === 'info'    && <Info          className="w-4 h-4 text-sage-400 dark:text-ocean-300 flex-shrink-0" />}
            <span className={`flex-1
              ${t.type === 'success' ? 'text-sage-800 dark:text-white' : ''}
              ${t.type === 'error'   ? 'text-red-700  dark:text-coral-pale' : ''}
              ${t.type === 'info'    ? 'text-sage-600 dark:text-white/80' : ''}
            `}>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"
              className="text-sage-300 hover:text-sage-500 dark:text-white/30 dark:hover:text-white/70 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
