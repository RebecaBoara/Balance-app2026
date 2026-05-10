'use client'
// Modal for creating a new task
// Fields: title, difficulty, estimated time, due date, notes

import { useState, useRef, useEffect } from 'react'
import { DifficultyType } from '@/types'
import Spinner from '@/components/ui/Spinner'
import { Plus, Minus, X, Clock, Calendar, Pencil } from 'lucide-react'

//Types
export interface NewTask {
  title:        string
  difficulty:   DifficultyType
  estimatedMin: number
  dueDate:      string
  dueTime:      string
  notes:        string
}

const EMPTY_TASK: NewTask = {
  title:        '',
  difficulty:   'medium',
  estimatedMin: 30,
  dueDate:      '',
  dueTime:      '',
  notes:        '',
}

const DIFFICULTY_OPTIONS: {
  value: DifficultyType
  label: string
  desc:  string
}[] = [
  { value: 'easy',   label: 'Easy',   desc: 'Under 20 min, low effort'   },
  { value: 'medium', label: 'Medium', desc: '20–60 min, moderate effort' },
  { value: 'hard',   label: 'Hard',   desc: '60+ min, high focus needed' },
]


interface AddTaskModalProps {
  onClose:      () => void
  onSave:       (task: NewTask) => Promise<void>
  initialTask?: NewTask & { id: string }
}

export default function AddTaskModal({ onClose, onSave, initialTask }: AddTaskModalProps) {
  const isEditing = !!initialTask
  const [newTask, setNewTask] = useState<NewTask>(initialTask ?? EMPTY_TASK)
  const [saving,  setSaving]  = useState(false)
  const titleRef              = useRef<HTMLInputElement>(null)

  // Focus title on open
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    setSaving(true)
    try {
      await onSave(newTask)
      setNewTask(EMPTY_TASK)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center
                 justify-center p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full md:max-w-3xl
                   bg-white dark:bg-ocean-800
                   rounded-t-2xl md:rounded-2xl
                   border border-sage-500/15 dark:border-ocean-600
                   shadow-lifted animate-slide-up
                   max-h-[85vh] md:max-h-[90vh] overflow-y-auto
                   pb-20 md:pb-0"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-sage-500/15 dark:border-ocean-600
                        sticky top-0 bg-white dark:bg-ocean-800 z-10">
          <h2
            id="modal-title"
            className="font-serif text-xl text-sage-900 dark:text-white"
          >
            {isEditing ? 'Edit task' : 'Add a new task'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-sage-400 dark:text-white/60
                       hover:text-sage-600 dark:hover:text-white
                       hover:bg-sage-50 dark:hover:bg-ocean-700
                       transition-all duration-200"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">

          {/* Two-column on desktop */}
          <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-6">

            {/* Left column — title, scheduling, notes */}
            <div className="space-y-4">

              {/* Title */}
              <div>
                <label htmlFor="task-title" className="label text-sage-500 dark:text-white/70">
                  Task title *
                </label>
                <input
                  id="task-title"
                  ref={titleRef}
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="What do you need to do?"
                  required
                  maxLength={100}
                  className="input"
                />
                <p className="text-xs text-sage-300 dark:text-white/50 text-right mt-1">
                  {newTask.title.length}/100
                </p>
              </div>

              {/* Est. time + Due date + Time — 3-col row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="task-time" className="label text-sage-500 dark:text-white/70">
                    <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    Est. time (min)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewTask(p => ({ ...p, estimatedMin: Math.max(5, p.estimatedMin - 5) }))}
                      className="w-9 h-10 flex-shrink-0 flex items-center justify-center rounded-md
                                 border border-sage-500/15 dark:border-ocean-600
                                 text-sage-500 dark:text-white hover:bg-sage-50 dark:hover:bg-ocean-700
                                 transition-colors"
                      aria-label="Decrease time"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      id="task-time"
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      value={newTask.estimatedMin}
                      onChange={e => setNewTask(p => ({ ...p, estimatedMin: parseInt(e.target.value) || 30 }))}
                      className="input text-center px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewTask(p => ({ ...p, estimatedMin: Math.min(480, p.estimatedMin + 5) }))}
                      className="w-9 h-10 flex-shrink-0 flex items-center justify-center rounded-md
                                 border border-sage-500/15 dark:border-ocean-600
                                 text-sage-500 dark:text-white hover:bg-sage-50 dark:hover:bg-ocean-700
                                 transition-colors"
                      aria-label="Increase time"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="task-due" className="label text-sage-500 dark:text-white/70">
                    <Calendar className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    Due date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    value={newTask.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    className="input"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="task-time-of-day" className="label text-sage-500 dark:text-white/70">
                    <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    Time (optional)
                  </label>
                  <input
                    id="task-time-of-day"
                    type="time"
                    value={newTask.dueTime}
                    onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="task-notes" className="label text-sage-500 dark:text-white/70">
                  Notes (optional)
                </label>
                <textarea
                  id="task-notes"
                  value={newTask.notes}
                  onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any extra details..."
                  rows={3}
                  maxLength={300}
                  className="input resize-none"
                />
              </div>

            </div>

            {/* Right column — difficulty */}
            <div className="mt-4 md:mt-0">
              <label className="label text-sage-500 dark:text-white/70">
                Difficulty *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {DIFFICULTY_OPTIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNewTask(p => ({ ...p, difficulty: value }))}
                    aria-pressed={newTask.difficulty === value}
                    className={`p-3 rounded-lg border-2 text-left
                                transition-all duration-200
                                ${newTask.difficulty === value
                                  ? value === 'easy'
                                    ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20'
                                    : value === 'medium'
                                    ? 'border-amber-app bg-amber-pale dark:bg-amber-900/20'
                                    : 'border-coral-app bg-coral-pale dark:bg-red-900/20'
                                  : 'border-sage-500/15 dark:border-ocean-600 hover:border-sage-300'
                                }`}
                  >
                    <p className="text-xs font-semibold text-sage-800 dark:text-white mb-0.5">
                      {label}
                    </p>
                    <p className="text-[10px] text-sage-400 dark:text-white/70 leading-tight">
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-5 mt-2 border-t border-sage-50 dark:border-ocean-700">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newTask.title.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Spinner size="sm" /> Saving...</>
              ) : isEditing ? (
                <><Pencil className="w-4 h-4" aria-hidden="true" /> Save changes</>
              ) : (
                <><Plus className="w-4 h-4" aria-hidden="true" /> Add task</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}