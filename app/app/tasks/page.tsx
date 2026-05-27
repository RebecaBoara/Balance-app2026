'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTasks, addTask, updateTask, toggleTask, deleteTask, getTodaysMood } from '@/lib/db'
import { getRecommendedTasks } from '@/lib/mood'
import { Task, MoodType, RepeatType } from '@/types'
import TaskCard     from '@/components/tasks/TaskCard'
import CalendarView  from '@/components/tasks/CalendarView'
import AddTaskModal, { NewTask } from '@/components/tasks/AddTaskModal'
import MoodSuggestionBanner from '@/components/tasks/MoodSuggestion'
import EmptyState           from '@/components/ui/EmptyState'
import PageHeader   from '@/components/ui/PageHeader'
import Spinner      from '@/components/ui/Spinner'
import Button       from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { Plus, CheckCircle2, Sparkles, AlertCircle, List, CalendarDays, ChevronDown } from 'lucide-react'

type FilterType = 'all' | 'today' | 'upcoming'
type ViewType   = 'list' | 'calendar'

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false
  return dateStr === new Date().toISOString().split('T')[0]
}

function isUpcoming(dateStr?: string): boolean {
  if (!dateStr) return false
  return dateStr > new Date().toISOString().split('T')[0]
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false
  return dateStr < new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function addWeeks(dateStr: string, weeks: number): string {
  return addDays(dateStr, weeks * 7)
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDay))
  return d.toISOString().split('T')[0]
}

function nextDateForRepeat(baseDate: string, repeat: Task['repeat']): string {
  if (repeat === 'daily') return addDays(baseDate, 1)
  if (repeat === 'weekly') return addWeeks(baseDate, 1)
  if (repeat === 'monthly') return addMonths(baseDate, 1)
  return baseDate
}

const COMPLETED_DAYS = 20

function isCompletedRecently(task: Task): boolean {
  if (!task.completed || !task.completedAt) return false
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - COMPLETED_DAYS)
  return task.completedAt >= cutoff.getTime()
}

export default function TasksPage() {
  const { user }                     = useAuth()
  const { toast }                    = useToast()
  const [tasks,      setTasks]       = useState<Task[]>([])
  const [todaysMood, setTodaysMood]  = useState<MoodType | null>(null)
  const [loading,    setLoading]     = useState(true)
  const [loadError,  setLoadError]   = useState(false)
  const [filter,     setFilter]      = useState<FilterType>('all')
  const [view,       setView]        = useState<ViewType>('list')
  const [showModal,   setShowModal]   = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [celebrated,  setCelebrated]  = useState<Set<string>>(new Set())
  const [deleting,       setDeleting]       = useState<string | null>(null)
  const [overdueOpen, setOverdueOpen] = useState(true)
  const [aiSuggestion,      setAiSuggestion]      = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [fetchedTasks, moodEntry] = await Promise.all([
          getTasks(user!.uid),
          getTodaysMood(user!.uid),
        ])
        setTasks(fetchedTasks)
        setTodaysMood(moodEntry?.mood ?? null)
        setAiSuggestion(moodEntry?.aiSuggestion)
      } catch (e) {
        console.error(e)
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  function applyFilter(taskList: Task[]): Task[] {
    switch (filter) {
      case 'today':    return taskList.filter(t => isToday(t.dueDate) || (!t.dueDate && !t.completed))
      case 'upcoming': return taskList.filter(t => isUpcoming(t.dueDate))
      default:         return taskList
    }
  }

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedToday  = tasks.filter(t => isCompletedRecently(t))
  const overdueTasks    = incompleteTasks.filter(t => isOverdue(t.dueDate))
  const filtered        = applyFilter(incompleteTasks)

  const { recommended, deferred } = todaysMood
    ? getRecommendedTasks(todaysMood, filtered)
    : { recommended: filtered, deferred: [] }


async function handleAddTask(data: NewTask) {
    if (!user) return
    try {
      const id = await addTask(
        user.uid,
        data.title.trim(),
        data.difficulty,
        data.priority,
        data.estimatedMin,
        data.repeat,
        data.dueDate || undefined,
        data.dueTime || undefined,
        data.notes   || undefined,
      )
      const created: Task = {
        id,
        userId:       user.uid,
        title:        data.title.trim(),
        difficulty:   data.difficulty,
        priority:     data.priority,
        estimatedMin: data.estimatedMin,
        repeat:       data.repeat,
        completed:    false,
        dueDate:      data.dueDate || undefined,
        dueTime:      data.dueTime || undefined,
        notes:        data.notes   || undefined,
        createdAt:    Date.now(),
      }
      setTasks(prev => [created, ...prev])
      setShowModal(false)
      toast.success('Task added successfully')
    } catch {
      toast.error('Could not save task. Please try again.')
    }
  }

  async function handleToggle(task: Task) {
    const nowCompleted = !task.completed
    setTasks(prev => prev.map(t =>
      t.id === task.id
        ? { ...t, completed: nowCompleted, completedAt: nowCompleted ? Date.now() : undefined }
        : t
    ))
    if (nowCompleted) {
      setCelebrated(prev => new Set(prev).add(task.id))
      setTimeout(() => {
        setCelebrated(prev => { const n = new Set(prev); n.delete(task.id); return n })
      }, 1500)
    }
    try {
      await toggleTask(task.id, nowCompleted)

      // Recurring tasks create the next instance when completed.
      if (nowCompleted && task.repeat && task.repeat !== 'none' && user) {
        const baseDate = task.dueDate || new Date().toISOString().split('T')[0]
        const nextDate = nextDateForRepeat(baseDate, task.repeat)
        const duplicateExists = tasks.some(t =>
          !t.completed &&
          t.repeat === task.repeat &&
          t.title.trim().toLowerCase() === task.title.trim().toLowerCase() &&
          t.dueDate === nextDate
        )

        if (!duplicateExists) {
          const nextId = await addTask(
            user.uid,
            task.title,
            task.difficulty,
            task.priority ?? false,
            task.estimatedMin,
            task.repeat,
            nextDate,
            task.dueTime,
            task.notes,
          )

          // Next occurrence is saved to Firestore but not added to local state —
          // it has a future date and would appear to revert the completed task.
        }
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    }
  }

  async function handleUpdateTask(data: NewTask) {
    if (!editingTask) return
    const updated = { ...editingTask, ...data }
    setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
    setEditingTask(null)
    try {
      await updateTask(editingTask.id, data)
      toast.success('Task updated')
    } catch {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t))
      toast.error('Could not update task. Please try again.')
    }
  }

  async function handleSetRepeat(task: Task, repeat: RepeatType) {
    const optimistic = { ...task, repeat }
    setTasks(prev => prev.map(t => (t.id === task.id ? optimistic : t)))

    try {
      await updateTask(task.id, {
        title: task.title,
        difficulty: task.difficulty,
        priority: task.priority ?? false,
        estimatedMin: task.estimatedMin,
        repeat,
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || '',
        notes: task.notes || '',
      })
    } catch {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)))
    }
  }

  async function handleDelete(taskId: string) {
    setDeleting(taskId)
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch {
      toast.error('Could not delete task. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-800 pb-24">

      <PageHeader
        title="Your tasks"
        subtitle={new Date().toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      />

      <div className="px-6 md:px-0">

        {loadError && (
          <div className="flex items-start gap-3 mb-4 px-4 py-3 rounded-sm
                          bg-coral-pale dark:bg-coral-app/15
                          border border-coral-app/30 dark:border-coral-app/40
                          animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-800 dark:text-coral-pale flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-800 dark:text-coral-pale">
              <span className="font-semibold">Could not load your tasks.</span>{' '}
              Check your internet connection and{' '}
              <button onClick={() => window.location.reload()} className="underline font-medium">
                try again
              </button>.
            </p>
          </div>
        )}

        <MoodSuggestionBanner mood={todaysMood} aiSuggestion={aiSuggestion} />


        {/* Filter tabs + view toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div role="tablist" aria-label="Task filter"
            className="flex gap-1 p-1 rounded-sm bg-sage-500/10 dark:bg-ocean-800
                       border border-sage-500/15 dark:border-ocean-600">
            {(['all', 'today', 'upcoming'] as FilterType[]).map(f => (
              <button key={f} role="tab" aria-selected={filter === f}
                onClick={() => { setFilter(f); setView('list') }}
                className={`px-3 py-1.5 rounded-sm text-sm font-medium
                            transition-all duration-200 capitalize
                            ${filter === f && view === 'list'
                              ? 'bg-sage-500 dark:bg-teal-600 text-white shadow-sm'
                              : 'text-sage-700 dark:text-white/70 hover:text-sage-700 dark:hover:text-white'
                            }`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setShowModal(true)}
              aria-label="Add new task"
              size="sm"
              className="px-3 py-2 rounded-sm"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add task
            </Button>
            <Button
              onClick={() => setView(v => v === 'calendar' ? 'list' : 'calendar')}
              aria-label={view === 'calendar' ? 'Switch to list view' : 'Switch to calendar view'}
              variant={view === 'calendar' ? 'primary' : 'secondary'}
              size="sm"
              className={`px-3 py-2 rounded-sm transition-all duration-200
                          ${view === 'calendar'
                            ? 'shadow-sm'
                            : 'border-sage-300 dark:border-ocean-500 text-sage-700 dark:text-white/80 hover:border-sage-400'
                          }`}
            >
              {view === 'calendar'
                ? <><List className="w-4 h-4" aria-hidden="true" /> List</>
                : <><CalendarDays className="w-4 h-4" aria-hidden="true" /> Calendar</>
              }
            </Button>
          </div>
        </div>

        {/* Calendar view */}
        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            celebrated={celebrated}
            deleting={deleting}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={setEditingTask}
          />
        )}

        {/* List view */}
        {view === 'list' && (
          <>
            {/* Empty state */}
            {incompleteTasks.length === 0 && completedToday.length === 0 && (
              <EmptyState
                icon="✦"
                title="No tasks yet"
                description="Add your first task to get started with mood-based recommendations."
                action={
                  <Button onClick={() => setShowModal(true)} className="px-6">
                    Add your first task
                  </Button>
                }
              />
            )}

            {/* Overdue — Today tab only */}
            {filter === 'today' && overdueTasks.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setOverdueOpen(o => !o)}
                  className="flex items-center gap-2 mb-2 w-full text-left"
                  aria-expanded={overdueOpen}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-coral-app dark:text-coral-pale flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm font-semibold text-coral-app dark:text-coral-pale uppercase tracking-wider flex-1">
                    Overdue
                  </p>
                  <span className="text-sm text-coral-app/70 dark:text-coral-pale/70">({overdueTasks.length})</span>
                  <span className="text-sm text-sage-400 dark:text-white/40 font-medium ml-2">
                    {overdueOpen ? 'Hide' : 'Show'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-sage-400 dark:text-white/40 transition-transform duration-200 ${overdueOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {overdueOpen && (
                  <div className="space-y-2">
                    {overdueTasks.map(task => (
                      <TaskCard key={task.id} task={task}
                        celebrated={celebrated.has(task.id)}
                        deleting={deleting === task.id}
                        onSetRepeat={handleSetRepeat}
                        onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTask} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommended */}
            {recommended.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-sage-700 dark:text-white/70" aria-hidden="true" />
                  <p className="text-sm font-semibold text-sage-700 dark:text-white/70 uppercase tracking-wider">
                    Recommended first
                  </p>
                  <span className="text-sm text-sage-700 dark:text-white/50">({recommended.length})</span>
                </div>
                <div className="space-y-2">
                  {recommended.map(task => (
                    <TaskCard key={task.id} task={task}
                      celebrated={celebrated.has(task.id)}
                      deleting={deleting === task.id}
                      onSetRepeat={handleSetRepeat}
                      onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTask} />
                  ))}
                </div>
              </div>
            )}

            {/* Deferred */}
            {deferred.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-sage-700 dark:text-white/70 uppercase tracking-wider">
                    Saved for later
                  </p>
                  <span className="text-sm text-sage-700 dark:text-white/50">({deferred.length})</span>
                </div>
                <div className="space-y-2 opacity-60">
                  {deferred.map(task => (
                    <TaskCard key={task.id} task={task}
                      celebrated={false}
                      deleting={deleting === task.id}
                      onSetRepeat={handleSetRepeat}
                      onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTask} deferred />
                  ))}
                </div>
              </div>
            )}

        {/* Completed recently */}
            {completedToday.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 dark:text-white/70" aria-hidden="true" />
                  <p className="text-sm font-semibold text-sage-700 dark:text-white/70 uppercase tracking-wider">
                Completed recently
                  </p>
                  <span className="text-sm text-sage-700 dark:text-white/50">({completedToday.length})</span>
                </div>
                <div className="space-y-2">
                  {completedToday.map(task => (
                    <TaskCard key={task.id} task={task}
                      celebrated={false}
                      deleting={deleting === task.id}
                      onSetRepeat={handleSetRepeat}
                      onToggle={handleToggle} onDelete={handleDelete} completed />
                  ))}
                </div>
              </div>
            )}

            {/* No tasks for filter */}
            {incompleteTasks.length > 0 && recommended.length === 0 && deferred.length === 0 && (
              <EmptyState
                icon="📅"
                title={`No ${filter} tasks`}
                description={
                  filter === 'today'
                    ? 'No tasks due today. Add one or check upcoming tasks.'
                    : 'No upcoming tasks scheduled. Add a task with a due date.'
                }
              />
            )}
          </>
        )}

      </div>

      {/* Add task modal */}
      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onSave={handleAddTask}
        />
      )}

      {/* Edit task modal */}
      {editingTask && (
        <AddTaskModal
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
          initialTask={{
            id:           editingTask.id,
            title:        editingTask.title,
            difficulty:   editingTask.difficulty,
            priority:     editingTask.priority ?? false,
            estimatedMin: editingTask.estimatedMin,
            repeat:       editingTask.repeat || 'none',
            dueDate:      editingTask.dueDate  || '',
            dueTime:      editingTask.dueTime  || '',
            notes:        editingTask.notes    || '',
          }}
        />
      )}

    </div>
  )
}
