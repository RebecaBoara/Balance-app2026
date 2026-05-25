'use client'

// Reusable task card component
// Used in task list screen for all three sections:
// recommended, deferred, and completed today

import { useState } from 'react'
import { Task, RepeatType } from '@/types'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Card from '@/components/ui/Card'
import { CheckCircle2, Clock, Calendar, Trash2, Pencil, Repeat } from 'lucide-react'

// Helpers
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false
  return dateStr === new Date().toISOString().split('T')[0]
}

function isOverdue(dateStr?: string, completed?: boolean): boolean {
  if (!dateStr || completed) return false
  return dateStr < new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function repeatLabel(repeat?: Task['repeat']): string {
  switch (repeat) {
    case 'daily': return 'Repeats: Daily'
    case 'weekly': return 'Repeats: Weekly'
    case 'monthly': return 'Repeats: Monthly'
    default: return 'Repeats: None'
  }
}

// Props
interface TaskCardProps {
  task:       Task
  celebrated: boolean
  deleting:   boolean
  onToggle:   (task: Task) => void
  onDelete:   (id: string) => void
  onSetRepeat?: (task: Task, repeat: RepeatType) => void
  onEdit?:    (task: Task) => void
  deferred?:  boolean
  completed?: boolean
}

export default function TaskCard({
  task,
  celebrated,
  deleting,
  onToggle,
  onDelete,
  onSetRepeat,
  onEdit,
  deferred  = false,
  completed = false,
}: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showRepeatMenu, setShowRepeatMenu] = useState(false)

  return (
    <Card
      className={`group relative transition-all duration-300 animate-fade-in
                 ${celebrated
                   ? 'border-sage-400 bg-sage-50 dark:bg-sage-900/20 scale-[1.01]'
                   : ''
                 }
                 ${completed
                   ? 'opacity-60'
                   : 'hover:border-sage-300 dark:hover:border-ocean-400 hover:shadow-card'
                 }`}
    >
      {/* Celebration flash overlay */}
      {celebrated && (
        <div className="absolute inset-0 rounded-md bg-sage-500/5
                        animate-pulse-soft pointer-events-none" />
      )}

      <div className="flex items-start gap-3 p-3 sm:p-4">

        {/*Checkbox */}
        <button
          onClick={() => onToggle(task)}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2
                      transition-all duration-200 flex items-center justify-center
                      ${task.completed
                        ? 'bg-sage-500 border-sage-500 dark:bg-teal-500 dark:border-teal-500'
                        : 'border-sage-300 dark:border-ocean-400 hover:border-sage-500'
                      }`}
        >
          {task.completed && (
            <CheckCircle2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug mb-1.5
                         ${task.completed
                           ? 'line-through text-sage-600 dark:text-white/50'
                           : 'text-sage-700 dark:text-white'
                         }`}>
            {task.title}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <DifficultyBadge difficulty={task.difficulty} />
            {(task.priority === true || (task.priority as unknown) === 'high') && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded
                               text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                Priority
              </span>
            )}

            <span className="text-xs text-sage-500 dark:text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {task.estimatedMin} min
            </span>

            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1
                                ${isOverdue(task.dueDate, task.completed)
                                  ? 'text-coral-app dark:text-coral-pale font-medium'
                                  : isToday(task.dueDate)
                                    ? 'text-amber-800 dark:text-amber-400 font-medium'
                                    : 'text-sage-500 dark:text-white/50'
                                }`}>
                <Calendar className="w-3 h-3" aria-hidden="true" />
                {isOverdue(task.dueDate, task.completed)
                  ? `Overdue · ${formatDate(task.dueDate)}`
                  : isToday(task.dueDate) ? 'Due today' : formatDate(task.dueDate)
                }
              </span>
            )}

            {task.dueTime && (
              <span className="text-xs text-sage-500 dark:text-white/50 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {formatTime(task.dueTime)}
              </span>
            )}

            {deferred && (
              <span className="text-xs text-sage-500 dark:text-white/40 italic">
                Saved for better energy
              </span>
            )}

            {task.notes && (
              <button
                onClick={() => setShowNotes(p => !p)}
                className="text-xs text-sage-400 dark:text-white/40
                           hover:text-sage-600 underline transition-colors"
              >
                {showNotes ? 'Hide notes' : 'Notes'}
              </button>
            )}
          </div>

          {task.notes && showNotes && (
            <p className="text-sm text-sage-600 dark:text-white/80
                          mt-2 leading-relaxed p-3 rounded-lg
                          bg-sage-50 dark:bg-ocean-800
                          border border-sage-500/15 dark:border-ocean-600
                          animate-fade-in">
              {task.notes}
            </p>
          )}
        </div>

        {/* Actions only */}
        <div className="flex-shrink-0 flex items-center gap-1 transition-all duration-200">
          {onSetRepeat && !completed && (
            <div className="relative">
              <button
                onClick={() => setShowRepeatMenu(v => !v)}
                aria-label={`Change repeat for: ${task.title}. Current: ${repeatLabel(task.repeat) || 'No repeat'}`}
                title={repeatLabel(task.repeat)}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xs transition-all duration-200
                           ${task.repeat && task.repeat !== 'none'
                             ? 'text-sage-700 bg-sage-50 dark:text-teal-300 dark:bg-teal-900/20'
                             : 'text-sage-500 dark:text-white/50'
                           }
                           hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-ocean-600`}
              >
                <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-xs leading-none">Repeat</span>
              </button>
              {showRepeatMenu && (
                <div className="absolute right-0 top-8 z-20 min-w-[170px] rounded-lg border border-sage-500/15 dark:border-ocean-600 bg-white dark:bg-ocean-700 shadow-card p-1">
                  {[
                    { value: 'none', label: 'No repeat' },
                    { value: 'daily', label: 'Every day' },
                    { value: 'weekly', label: 'Every week' },
                    { value: 'monthly', label: 'Every month' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onSetRepeat(task, opt.value as RepeatType)
                        setShowRepeatMenu(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors
                                 ${task.repeat === opt.value
                                   ? 'bg-sage-50 text-sage-700 dark:bg-teal-900/20 dark:text-teal-300'
                                   : 'text-sage-600 dark:text-white/80 hover:bg-sage-50 dark:hover:bg-ocean-600'
                                 }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {onEdit && !completed && (
            <button
              onClick={() => onEdit(task)}
              aria-label={`Edit task: ${task.title}`}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xs
                         text-sage-500 dark:text-white/50
                         hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-ocean-600
                         transition-all duration-200"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs leading-none">Edit</span>
            </button>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete task: ${task.title}`}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xs
                       text-sage-500 dark:text-white/50
                       hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-xs leading-none">Delete</span>
          </button>
        </div>

        {confirmDelete && (
          <ConfirmDialog
            message={`Delete "${task.title}"?`}
            loading={deleting}
            onConfirm={() => { setConfirmDelete(false); onDelete(task.id) }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}

      </div>
    </Card>
  )
}
