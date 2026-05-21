'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardStats, toggleTask } from '@/lib/db'
import { getMoodEmoji, getMoodLabel } from '@/lib/mood'
import { MoodType, Task } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import StatCard from '@/components/dashboard/StatCard'
import InsightCard from '@/components/dashboard/InsightCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  CheckCircle2,Smile, Flame, ArrowRight, AlertCircle, X
} from 'lucide-react'

// types
interface Stats {
  tasksCompleted:   number
  completionRate:   number
  checkInsThisWeek: number
  topMood:          MoodType | null
  moodHistory:      { date: string; mood: MoodType; note: string }[]
  streak:           number
  incompleteTasks:  Task[]
}

//Mood chart colours 
const MOOD_COLOURS: Record<MoodType, string> = {
  exhausted: '#9B8FC5',
  stressed:  '#C5614A',
  neutral:   '#D4924A',
  good:      '#5C7A6A',
  energised: '#4A7A9B',
}

const MOOD_HEIGHT: Record<MoodType, number> = {
  exhausted: 32,
  stressed:  52,
  neutral:   76,
  good:      100,
  energised: 120,
}

// Helpers 
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-GB', { weekday: 'short' })
    .charAt(0)
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

function getInsight(stats: Stats): string {
  if (stats.tasksCompleted === 0) return "Add your first tasks and check in daily — Balance will start showing you patterns in how you work and feel."
  if (stats.streak >= 5)         return `${stats.streak} days in a row — that kind of consistency adds up more than you realise. Keep it going.`
  if (stats.completionRate >= 80) return `${stats.completionRate}% completion rate this week. You're in a good rhythm — this is when the best habits form.`
  if (stats.completionRate < 40)  return "A quieter week on tasks — that's okay. Checking in daily helps Balance understand your rhythm and give you better recommendations over time."
  if (stats.topMood === 'energised' || stats.topMood === 'good') return `You've been feeling ${getMoodLabel(stats.topMood!).toLowerCase()} most of this week. Good energy is worth using — this is a great time for your more meaningful work.`
  if (stats.topMood === 'exhausted' || stats.topMood === 'stressed') return "It's been a heavy week. Rest is part of the process — even small progress on low-energy days counts."
  return `${stats.tasksCompleted} tasks completed this week. Check in daily to help Balance build a clearer picture of when you work best.`
}

const TODAY_STR = new Date().toISOString().split('T')[0]

// Main page
export default function DashboardPage() {
  const { user }                   = useAuth()
  const [stats,     setStats]      = useState<Stats | null>(null)
  const [focusTasks, setFocusTasks] = useState<Task[]>([])
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([])
  const [loading,   setLoading]    = useState(true)
  const [loadError, setLoadError]  = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const data = await getDashboardStats(user!.uid)
        setStats(data as Stats)
        const urgent = (data.incompleteTasks as Task[]).filter(
          t => !t.dueDate || t.dueDate <= TODAY_STR
        ).sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
        setFocusTasks(urgent)
      } catch (e) {
        console.error('[Dashboard] Failed to load stats:', e)
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleFocusToggle(task: Task) {
    setFocusTasks(prev => prev.filter(t => t.id !== task.id))
    setStats(prev => prev ? { ...prev, tasksCompleted: prev.tasksCompleted + 1 } : prev)
    try {
      await toggleTask(task.id, true)
    } catch {
      setFocusTasks(prev => [task, ...prev])
      setStats(prev => prev ? { ...prev, tasksCompleted: prev.tasksCompleted - 1 } : prev)
    }
  }

  function handleDismissTask(taskId: string) {
    setDismissedTaskIds(prev => [...prev, taskId])
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }
  if (!stats || (stats.tasksCompleted === 0 && stats.checkInsThisWeek === 0)) {
    return (
      <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 pb-24">
        <PageHeader title="Dashboard" subtitle="Your productivity insights" />
        <EmptyState
          icon="📊"
          title="No data yet"
          description="Check in with your mood and add some tasks to start seeing your productivity and wellbeing insights here."
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/app/mood" className="px-6">
                Check in now <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button href="/app/tasks" variant="secondary" className="px-6">
                View tasks
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  const last7Days  = getLast7Days()
  const moodMap    = Object.fromEntries(stats.moodHistory.map(m => [m.date, m.mood]))
  const insight    = getInsight(stats)
  const visibleFocusTasks = focusTasks.filter(task => !dismissedTaskIds.includes(task.id))

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 pb-24">

      <PageHeader
        title="Dashboard"
        subtitle={`Week of ${new Date(last7Days[0] + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(last7Days[6] + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
      />

      <div className="px-6 md:px-0 space-y-5">

        {loadError && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-sm
                          bg-coral-pale dark:bg-coral-app/15
                          border border-coral-app/30 dark:border-coral-app/40
                          animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-800 dark:text-coral-pale flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-md text-red-800 dark:text-coral-pale">
              <span className="font-semibold">Could not load your dashboard.</span>{' '}
              Check your connection and{' '}
              <button onClick={() => window.location.reload()} className="underline font-medium">
                try again
              </button>.
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Tasks completed"
            value={stats.tasksCompleted}
            accent
          />
          <StatCard
            
            label="Completion rate"
            value={`${stats.completionRate}%`}
            sub="this week"
          />
          <StatCard
            
            label="Mood check-ins"
            value={stats.checkInsThisWeek}
            sub="this week"
          />
          <StatCard
            
            label="Top mood"
            value={stats.topMood ? getMoodEmoji(stats.topMood) : '—'}
            sub={stats.topMood ? getMoodLabel(stats.topMood) : 'No check-ins yet'}
          />
        </div>

        

        <div className="grid md:grid-cols-2 gap-4">
          {/* Mood chart */}
          <div className="bg-white dark:bg-ocean-700 rounded-sm p-6 border border-sage-500/15 dark:border-ocean-600 shadow-raised animate-fade-in">
            <h3 className="text-sm font-semibold text-sage-800 dark:text-white mb-5">Weekly mood overview</h3>

            <div className="flex items-end gap-2 h-32 mb-4">
              {last7Days.map(date => {
                const mood = moodMap[date] as MoodType | undefined
                const height = mood ? MOOD_HEIGHT[mood] : 6
                const colour = mood ? MOOD_COLOURS[mood] : '#E8F0EC'
                const today = isToday(date)

                return (
                  <div key={date} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${today ? 'ring-2 ring-sage-400 ring-offset-1' : ''}`}
                      style={{ height: `${height}px`, backgroundColor: colour }}
                    />
                    <span className={`text-sm ${today ? 'text-sage-700 dark:text-teal-400 font-medium' : 'text-sage-500 dark:text-white/70'}`}>
                      {getDayLabel(date)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {(Object.entries(MOOD_COLOURS) as [MoodType, string][]).map(([mood, colour]) => (
                <div key={mood} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colour }} />
                  <span className="text-sm text-sage-600 dark:text-white/70">{getMoodLabel(mood)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white dark:bg-ocean-700 rounded-sm p-6
                          border border-sage-500/15 dark:border-ocean-600 shadow-raised animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <Flame className="w-4 h-4 text-amber-app" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-sage-800 dark:text-white">
                Check-in streak
              </h3>
              <span className="ml-auto font-serif text-2xl text-sage-900 dark:text-white">
                {stats.streak}
              </span>
              <span className="text-sm text-sage-400 dark:text-white">days</span>
            </div>

            {/* Streak dots */}
            <div className="h-32 flex items-center">
            <div className="flex gap-1.5 w-full mb-1">
              {last7Days.map(date => {
                const hasMood = !!moodMap[date]
                const today   = isToday(date)
                return (
                  <div key={date} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      title={`${getDayLabel(date)} — ${hasMood ? getMoodLabel(moodMap[date]) : 'no check-in'}`}
                      className={`w-full h-8 rounded-md flex items-center justify-center text-sm font-medium
                                  transition-all duration-200
                                  ${hasMood
                                    ? 'bg-sage-500 dark:bg-teal-600 text-white'
                                    : today
                                    ? 'bg-sage-50 dark:bg-sage-900/20 border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-white/70'
                                    : 'bg-warm-200 dark:bg-ocean-800 text-sage-300 dark:text-white/70'
                                  }`}
                    >
                      {hasMood ? '\u2713' : ''}
                    </div>
                    <span className={`text-sm ${today ? 'text-sage-700 dark:text-teal-400 font-medium' : 'text-sage-500 dark:text-white/70'}`}>
                      {getDayLabel(date)}
                    </span>
                  </div>
                )
              })}
            </div>
            </div>

            {stats.streak === 0 && (
              <p className="text-sm text-sage-700 dark:text-white/70">
                Check in today to start your streak!
              </p>
            )}
            {stats.streak >= 3 && (
              <p className="text-sm text-sage-700 dark:text-white/70 font-medium">
                {stats.streak} day streak — keep it going!
              </p>
            )}
            {stats.streak === 1 && (
              <p className="text-sm text-sage-700 dark:text-white/70">
                Great start! Come back tomorrow to build your streak.
              </p>
            )}
          </div>
        </div>


        <InsightCard insight={insight} />

        {/* Mood breakdown + Recent reflections */}
        {stats.moodHistory.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">

            {/* Mood breakdown */}
            <div className="bg-white dark:bg-ocean-700 rounded-sm p-5
                            border border-sage-500/15 dark:border-ocean-600 shadow-raised animate-fade-in">
              <h3 className="text-sm font-semibold text-sage-800 dark:text-white mb-4">
                Mood breakdown
              </h3>
              <div className="space-y-2.5">
                {Object.entries(
                  stats.moodHistory.reduce((acc, { mood }) => {
                    acc[mood] = (acc[mood] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const pct = Math.round((count / stats.moodHistory.length) * 100)
                    return (
                      <div key={mood}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" aria-hidden="true">
                              {getMoodEmoji(mood as MoodType)}
                            </span>
                            <span className="text-sm text-sage-600 dark:text-white/70">
                              {getMoodLabel(mood as MoodType)}
                            </span>
                          </div>
                          <span className="text-sm text-sage-400 dark:text-white/70">
                            {count}× ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-sage-50 dark:bg-ocean-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width:           `${pct}%`,
                              backgroundColor: MOOD_COLOURS[mood as MoodType],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Recent reflections */}
            <div className="bg-white dark:bg-ocean-700 rounded-sm
                            border border-sage-500/15 dark:border-ocean-600 shadow-raised animate-fade-in">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <Smile className="w-4 h-4 text-sage-500 dark:text-white" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-sage-800 dark:text-white">
                  Recent reflections
                </h3>
              </div>
              <ul className="divide-y divide-sage-500/10 dark:divide-ocean-600">
                {stats.moodHistory.map(({ date, mood, note }) => (
                  <li key={date} className="px-5 py-3 flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                      {getMoodEmoji(mood)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-sage-700 dark:text-white">
                          {getMoodLabel(mood)}
                        </p>
                        <p className="text-sm text-sage-400 dark:text-white/40">
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>
                      {note ? (
                        <p className="text-sm text-sage-600 dark:text-white/70 leading-relaxed">
                          {note}
                        </p>
                      ) : (
                        <p className="text-sm text-sage-300 dark:text-white/30 italic">
                          No note written
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* Today's focus */}
        {focusTasks.length > 0 && (
          <div className="bg-white dark:bg-ocean-700 rounded-sm
                          border border-sage-500/15 dark:border-ocean-600 shadow-raised animate-fade-in">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-500 dark:text-white" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-sage-800 dark:text-white">
                  Today&apos;s focus
                </h3>
              </div>
              <Link href="/app/tasks"
                className="text-sm text-sage-400 dark:text-white/50 hover:text-sage-600 transition-colors flex items-center gap-1">
                See all <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>

            <ul className="divide-y divide-sage-500/10 dark:divide-ocean-600">
              {visibleFocusTasks.slice(0, 5).map(task => {
                const overdue = task.dueDate && task.dueDate < TODAY_STR
                const dueToday = task.dueDate === TODAY_STR
                return (
                  <li key={task.id}
                    className="flex items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => handleFocusToggle(task)}
                      aria-label={`Mark "${task.title}" as complete`}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2
                                 border-sage-300 dark:border-ocean-400
                                 hover:border-sage-500 hover:bg-sage-50
                                 transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sage-800 dark:text-white truncate">
                        {task.title}
                      </p>
                      {(overdue || dueToday) && (
                        <p className={`text-sm mt-0.5 ${overdue ? 'text-coral-app dark:text-coral-pale' : 'text-amber-800 dark:text-amber-400'}`}>
                          {overdue ? `Overdue · ${new Date(task.dueDate! + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Due today'}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
                      ${task.difficulty === 'easy'   ? 'bg-sage-50 text-sage-600 dark:bg-sage-900/20 dark:text-sage-300'
                      : task.difficulty === 'medium' ? 'bg-amber-pale text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                      :                                'bg-coral-pale text-coral-app dark:bg-red-900/20 dark:text-coral-pale'}`}>
                      {task.difficulty}
                    </span>
                    {overdue && (
                      <button
                        onClick={() => handleDismissTask(task.id)}
                        aria-label={`Dismiss overdue task "${task.title}"`}
                        className="flex-shrink-0 p-1 rounded-sm text-coral-app dark:text-coral-pale hover:bg-coral-pale/60 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            {visibleFocusTasks.length > 5 && (
              <div className="px-5 py-3 border-t border-sage-500/10 dark:border-ocean-600">
                <Link href="/app/tasks"
                  className="text-sm text-sage-400 dark:text-white/50 hover:text-sage-600 transition-colors">
                  +{visibleFocusTasks.length - 5} more tasks
                </Link>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}
