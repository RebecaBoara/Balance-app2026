'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TaskCard from './TaskCard'

interface CalendarViewProps {
  tasks:      Task[]
  celebrated: Set<string>
  deleting:   string | null
  onToggle:   (task: Task) => void
  onDelete:   (id: string) => void
  onEdit:     (task: Task) => void
}

const TODAY = new Date().toISOString().split('T')[0]

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    )
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function CalendarView({
  tasks, celebrated, deleting, onToggle, onDelete, onEdit,
}: CalendarViewProps) {
  const now = new Date()
  const [cur, setCur]           = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<string | null>(TODAY)

  const cells = getMonthGrid(cur.year, cur.month)

  const tasksByDay = new Map<string, Task[]>()
  tasks.forEach(t => {
    if (!t.dueDate) return
    const list = tasksByDay.get(t.dueDate) ?? []
    list.push(t)
    tasksByDay.set(t.dueDate, list)
  })

  const monthLabel = new Date(cur.year, cur.month, 1).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  })

  function prev() {
    setCur(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  }
  function next() {
    setCur(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })
  }

  const selectedTasks = selected ? (tasksByDay.get(selected) ?? []) : []

  return (
    <div className="animate-fade-in bg-white dark:bg-ocean-700
                    rounded-2xl border border-sage-500/15 dark:border-ocean-600
                    shadow-card p-5">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-sage-600 dark:text-white/70" />
        </button>
        <p className="font-serif text-base text-sage-900 dark:text-white">{monthLabel}</p>
        <button
          onClick={next}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-sage-600 dark:text-white/70" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <p key={d} className="text-center text-xs font-medium text-sage-400 dark:text-white/40 py-1">
            {d}
          </p>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={i} />

          const dayTasks  = tasksByDay.get(dateStr) ?? []
          const isToday   = dateStr === TODAY
          const isOverdue = dateStr < TODAY && dayTasks.some(t => !t.completed)
          const isSel     = dateStr === selected
          const dayNum    = Number(dateStr.split('-')[2])

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(isSel ? null : dateStr)}
              aria-pressed={isSel}
              aria-label={`${dateStr}${dayTasks.length ? `, ${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''}` : ''}`}
              className={`flex flex-col items-center py-1.5 rounded-lg transition-all duration-150
                          ${isSel
                            ? 'bg-sage-500 dark:bg-teal-600'
                            : isToday
                              ? 'bg-amber-pale dark:bg-amber-900/20'
                              : 'hover:bg-sage-50 dark:hover:bg-ocean-700'
                          }`}
            >
              <span className={`text-sm leading-none mb-1
                                ${isSel    ? 'text-white font-semibold'
                                : isToday  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                                :            'text-sage-800 dark:text-white'}`}>
                {dayNum}
              </span>

              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5">
                  {dayTasks.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className={`w-1 h-1 rounded-full
                        ${isSel         ? 'bg-white/70'
                        : t.completed   ? 'bg-sage-300 dark:bg-white/30'
                        : isOverdue     ? 'bg-coral-app dark:bg-coral-pale'
                        : isToday       ? 'bg-amber-app'
                        :                 'bg-sage-400 dark:bg-teal-400'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="mt-5 animate-fade-in">
          <p className="text-xs font-semibold text-sage-600 dark:text-white/50 uppercase tracking-wider mb-3">
            {new Date(selected + 'T00:00:00').toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
            {' · '}
            {selectedTasks.length === 0
              ? 'No tasks'
              : `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`}
          </p>

          {selectedTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  celebrated={celebrated.has(task.id)}
                  deleting={deleting === task.id}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-sage-400 dark:text-white/40 text-center py-8">
              No tasks due on this day
            </p>
          )}
        </div>
      )}

    </div>
  )
}
