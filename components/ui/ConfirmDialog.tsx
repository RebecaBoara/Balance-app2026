'use client'

import Spinner from '@/components/ui/Spinner'

interface ConfirmDialogProps {
  message:    string
  confirmLabel?: string
  cancelLabel?:  string
  loading?:   boolean
  onConfirm:  () => void
  onCancel:   () => void
}

export default function ConfirmDialog({
  message,
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  loading      = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={message}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-ocean-800
                   rounded-2xl shadow-xl p-6
                   border border-sage-500/15 dark:border-ocean-600"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-sage-900 dark:text-white mb-5 text-center">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium
                       text-sage-700 dark:text-white/70
                       bg-sage-50 dark:bg-ocean-700
                       border border-sage-500/15 dark:border-ocean-600
                       hover:bg-sage-100 dark:hover:bg-ocean-600
                       transition-all duration-200"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white
                       bg-red-500 hover:bg-red-600
                       dark:bg-red-600 dark:hover:bg-red-500
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" variant="white" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
