'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { getUserProfile } from '@/lib/db'
import { useToast } from '@/components/ui/Toaster'
import { getMoodEmoji, getMoodLabel } from '@/lib/mood'
import Spinner from '@/components/ui/Spinner'
import { Trash2, AlertTriangle, EyeOff, Eye } from 'lucide-react'
import type { MoodType, DifficultyType } from '@/types'

function toLocalDateStr(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MOOD_COLOURS: Record<MoodType, string> = {
  exhausted: '#9B8FC5',
  stressed:  '#C5614A',
  neutral:   '#D4924A',
  good:      '#5C7A6A',
  energised: '#4A7A9B',
}

interface MoodDoc  { userId: string; mood: MoodType; date: string; note: string; createdAt: number }
interface TaskDoc  { userId: string; title: string; difficulty: DifficultyType; completed: boolean; createdAt: number }
interface UserDoc  { uid: string; email: string; displayName: string; createdAt: number; isAdmin?: boolean }
interface Stats    { users: UserDoc[]; moods: MoodDoc[]; tasks: TaskDoc[] }

function ActivityLineChart({ moods, tasks }: { moods: MoodDoc[]; tasks: TaskDoc[] }) {
  const DAYS = 14
  const today = new Date()

  const labels = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return toLocalDateStr(d.getTime())
  })

  const checkIns  = labels.map(d => moods.filter(m => m.date === d).length)
  const completed = labels.map(d =>
    tasks.filter(t => t.completed && toLocalDateStr(t.createdAt) === d).length
  )

  const maxVal = Math.max(...checkIns, ...completed, 1)

  const W = 560, H = 160
  const PL = 28, PR = 8, PT = 8, PB = 24
  const cW = W - PL - PR
  const cH = H - PT - PB

  const px = (i: number) => PL + (i / (DAYS - 1)) * cW
  const py = (v: number) => PT + cH - (v / maxVal) * cH
  const toPath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
  const close = `L${px(DAYS - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${px(0).toFixed(1)},${(PT + cH).toFixed(1)} Z`

  const yTicks = maxVal <= 4
    ? Array.from({ length: maxVal + 1 }, (_, i) => i)
    : [0, Math.round(maxVal * 0.5), maxVal]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {yTicks.map(tick => (
        <g key={tick}>
          <line x1={PL} y1={py(tick)} x2={W - PR} y2={py(tick)}
            stroke="currentColor" strokeWidth="1" strokeOpacity="0.08" />
          {tick > 0 && (
            <text x={PL - 5} y={py(tick) + 3.5} textAnchor="end"
              fontSize="9" fill="currentColor" fillOpacity="0.35">{tick}</text>
          )}
        </g>
      ))}

      <path d={`${toPath(checkIns)} ${close}`}  fill="#5C7A6A" fillOpacity="0.08" />
      <path d={`${toPath(completed)} ${close}`} fill="#D4924A" fillOpacity="0.08" />

      <path d={toPath(checkIns)}  fill="none" stroke="#5C7A6A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d={toPath(completed)} fill="none" stroke="#D4924A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {checkIns.map((v, i)  => <circle key={`c${i}`} cx={px(i)} cy={py(v)} r="2.5" fill="#5C7A6A" />)}
      {completed.map((v, i) => <circle key={`t${i}`} cx={px(i)} cy={py(v)} r="2.5" fill="#D4924A" />)}

      {labels.map((d, i) => {
        if (i % 2 !== 0 && i !== DAYS - 1) return null
        const [yr, mo, dy] = d.split('-').map(Number)
        const label = `${dy} ${new Date(yr, mo - 1, dy).toLocaleDateString('en-GB', { month: 'short' })}`
        return (
          <text key={d} x={px(i)} y={H - 4} textAnchor="middle"
            fontSize="9" fill="currentColor" fillOpacity="0.4">{label}</text>
        )
      })}
    </svg>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-ocean-800 rounded-md p-5 border border-sage-100 dark:border-ocean-600 shadow-raised">
      <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-serif text-3xl text-sage-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-sage-400 dark:text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [tab,        setTab]        = useState<'overview' | 'participants'>('overview')
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [confirmUid, setConfirmUid] = useState<string | null>(null)
  const [anonymise,  setAnonymise]  = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }

    async function load() {
      try {
        const profile = await getUserProfile(user!.uid)
        if (!profile?.isAdmin) { router.push('/app/mood'); return }

        const [usersSnap, moodsSnap, tasksSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'moods')),
          getDocs(collection(db, 'tasks')),
        ])
        setStats({
          users: usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserDoc)),
          moods: moodsSnap.docs.map(d => d.data() as MoodDoc),
          tasks: tasksSnap.docs.map(d => d.data() as TaskDoc),
        })
      } catch (e) {
        console.error(e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading, router])

  async function handleDeleteUser(uid: string) {
    setDeleting(uid)
    setConfirmUid(null)
    try {
      // Get ID token first — before any Firestore deletions (profile must still exist for admin check)
      const idToken = await user!.getIdToken()

      // Delete Firebase Auth account via server route (verified before Firestore deletions)
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid }),
      })
      if (!res.ok) throw new Error('Auth delete failed')

      // Remove from local state
      setStats(prev => prev ? {
        users: prev.users.filter(u => u.uid !== uid),
        moods: prev.moods.filter(m => m.userId !== uid),
        tasks: prev.tasks.filter(t => t.userId !== uid),
      } : null)
      toast.success('Participant deleted successfully.')
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete. Check your connection and try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-100 dark:bg-ocean-900">
        <Spinner size="md" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-100 dark:bg-ocean-900">
        <p className="text-sage-500 dark:text-white/50">Failed to load admin data.</p>
      </div>
    )
  }

  const adminUid  = stats.users.find(u => u.isAdmin)?.uid ?? ''
  const users     = stats.users.filter(u => !u.isAdmin)
  const moods     = stats.moods.filter(m => m.userId !== adminUid)
  const tasks     = stats.tasks.filter(t => t.userId !== adminUid)

  // Overview stats
  const totalUsers       = users.length
  const totalCheckIns    = moods.length
  const totalTasks       = tasks.length
  const completedTasks   = tasks.filter(t => t.completed).length
  const completionRate   = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const activeUsers      = new Set(moods.map(m => m.userId)).size
  const sevenDaysAgo     = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const checkInsThisWeek = moods.filter(m => new Date(m.date) >= sevenDaysAgo).length

  const moodCounts = (['exhausted', 'stressed', 'neutral', 'good', 'energised'] as MoodType[]).map(mood => ({
    mood, count: moods.filter(m => m.mood === mood).length,
  }))
  const maxMoodCount = Math.max(...moodCounts.map(m => m.count), 1)

  const diffCounts: Record<DifficultyType, number> = { easy: 0, medium: 0, hard: 0 }
  tasks.forEach(t => { diffCounts[t.difficulty]++ })

  const userSummary = users.map(u => ({
    ...u,
    checkIns: moods.filter(m => m.userId === u.uid).length,
    taskCount: tasks.filter(t => t.userId === u.uid).length,
    done:      tasks.filter(t => t.userId === u.uid && t.completed).length,
  })).sort((a, b) => b.checkIns - a.checkIns)

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-widest mb-1">Balance — Admin</p>
            <h1 className="font-serif text-3xl text-sage-900 dark:text-white">Dashboard</h1>
          </div>
          <Link href="/app/mood"
            className="text-sm text-sage-500 dark:text-white/60 hover:text-sage-800 dark:hover:text-white transition-colors">
            ← Back to app
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-6 w-fit rounded-md bg-sage-500/10 dark:bg-ocean-800 border border-sage-500/15 dark:border-ocean-600">
          {(['overview', 'participants'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-sm text-sm font-medium capitalize transition-all duration-200
                          ${tab === t
                            ? 'bg-sage-500 dark:bg-teal-600 text-white shadow-sm'
                            : 'text-sage-600 dark:text-white/60 hover:text-sage-900 dark:hover:text-white'
                          }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Registered users"  value={totalUsers} />
              <StatCard label="Users checked in"  value={activeUsers} sub={`of ${totalUsers} registered`} />
              <StatCard label="Total check-ins"   value={totalCheckIns} sub={`${checkInsThisWeek} this week`} />
              <StatCard label="Task completion"   value={`${completionRate}%`} sub={`${completedTasks} of ${totalTasks}`} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Mood distribution */}
              <div className="bg-white dark:bg-ocean-800 rounded-md p-5 border border-sage-100 dark:border-ocean-600 shadow-raised">
                <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-wider mb-4">Mood distribution</p>
                <div className="space-y-3">
                  {moodCounts.map(({ mood, count }) => (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="text-sm w-24 text-sage-600 dark:text-white/70 flex items-center gap-1.5">
                        {getMoodEmoji(mood)} {getMoodLabel(mood)}
                      </span>
                      <div className="flex-1 bg-sage-50 dark:bg-ocean-700 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxMoodCount) * 100}%`, backgroundColor: MOOD_COLOURS[mood] }} />
                      </div>
                      <span className="text-sm font-medium text-sage-700 dark:text-white w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="bg-white dark:bg-ocean-800 rounded-md p-5 border border-sage-100 dark:border-ocean-600 shadow-raised">
                <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-wider mb-4">Task difficulty breakdown</p>
                <div className="space-y-3">
                  {(['easy', 'medium', 'hard'] as DifficultyType[]).map(d => (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-sm w-16 text-sage-600 dark:text-white/70 capitalize">{d}</span>
                      <div className="flex-1 bg-sage-50 dark:bg-ocean-700 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-sage-400 dark:bg-teal-500 transition-all duration-500"
                          style={{ width: `${totalTasks > 0 ? (diffCounts[d] / totalTasks) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium text-sage-700 dark:text-white w-6 text-right">{diffCounts[d]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-sage-400 dark:text-white/40 mt-4 pt-4 border-t border-sage-50 dark:border-ocean-700">
                  {totalTasks} total tasks across all users
                </p>
              </div>
            </div>

            {/* Activity chart */}
            <div className="bg-white dark:bg-ocean-800 rounded-md border border-sage-100 dark:border-ocean-600 shadow-raised overflow-hidden">
              <div className="px-5 py-4 border-b border-sage-50 dark:border-ocean-700 flex items-center justify-between">
                <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-wider">Activity — last 14 days</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-sage-400 dark:text-white/40">
                    <span className="w-5 h-[2px] rounded-full bg-[#5C7A6A] inline-block" />
                    Check-ins
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-sage-400 dark:text-white/40">
                    <span className="w-5 h-[2px] rounded-full bg-[#D4924A] inline-block" />
                    Tasks completed
                  </span>
                </div>
              </div>
              <div className="px-5 py-4 text-sage-900 dark:text-white">
                <ActivityLineChart moods={moods} tasks={tasks} />
              </div>
            </div>
          </>
        )}

        {/* ── PARTICIPANTS TAB ── */}
        {tab === 'participants' && (
          <div className="bg-white dark:bg-ocean-800 rounded-md border border-sage-100 dark:border-ocean-600 shadow-raised overflow-hidden">
            <div className="px-5 py-4 border-b border-sage-50 dark:border-ocean-700 flex items-center justify-between">
              <p className="text-xs text-sage-400 dark:text-white/40 uppercase tracking-wider">
                Participants ({totalUsers})
              </p>
              <button
                onClick={() => setAnonymise(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                            ${anonymise
                              ? 'bg-sage-500 border-sage-500 text-white dark:bg-teal-600 dark:border-teal-600'
                              : 'border-sage-200 dark:border-ocean-600 text-sage-500 dark:text-white/50 hover:bg-sage-50 dark:hover:bg-ocean-700'
                            }`}>
                {anonymise ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {anonymise ? 'Anonymised' : 'Anonymise'}
              </button>
            </div>

            {userSummary.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-sage-400 dark:text-white/40">No participants yet</p>
            ) : (
              <div className="divide-y divide-sage-50 dark:divide-ocean-700">
                {userSummary.map((u, i) => (
                  <div key={u.uid ?? u.email} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-ocean-700 flex items-center justify-center
                                    text-sage-600 dark:text-white/70 font-semibold text-sm flex-shrink-0">
                      {anonymise ? `P${i + 1}` : (u.displayName || u.email || '?').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sage-800 dark:text-white truncate">
                        {anonymise ? `Participant ${i + 1}` : (u.displayName || '—')}
                      </p>
                      <p className="text-xs text-sage-400 dark:text-white/40 truncate">
                        {anonymise ? '••••••••@••••••' : u.email}
                      </p>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
                      <div>
                        <p className="text-sm font-medium text-sage-700 dark:text-white">{u.checkIns}</p>
                        <p className="text-xs text-sage-400 dark:text-white/40">check-ins</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-sage-700 dark:text-white">{u.taskCount}</p>
                        <p className="text-xs text-sage-400 dark:text-white/40">tasks</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-sage-700 dark:text-white">
                          {u.taskCount > 0 ? `${Math.round((u.done / u.taskCount) * 100)}%` : '—'}
                        </p>
                        <p className="text-xs text-sage-400 dark:text-white/40">done</p>
                      </div>
                      <div>
                        <p className="text-xs text-sage-400 dark:text-white/40">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                        <p className="text-xs text-sage-400 dark:text-white/40">joined</p>
                      </div>
                    </div>

                    {/* Delete */}
                    {confirmUid === u.uid ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-coral-pale">Sure?</span>
                        <button
                          onClick={() => handleDeleteUser(u.uid)}
                          disabled={deleting === u.uid}
                          className="px-3 py-1 rounded-md text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                          {deleting === u.uid ? 'Deleting…' : 'Yes, delete'}
                        </button>
                        <button onClick={() => setConfirmUid(null)}
                          className="px-3 py-1 rounded-md text-xs font-medium border border-sage-200 dark:border-ocean-600
                                     text-sage-600 dark:text-white/70 hover:bg-sage-50 dark:hover:bg-ocean-700 transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmUid(u.uid)}
                        aria-label={`Delete ${u.displayName || u.email}`}
                        className="p-2 rounded-md text-sage-400 dark:text-white/30
                                   hover:bg-red-50 dark:hover:bg-coral-app/10
                                   hover:text-red-500 dark:hover:text-coral-pale
                                   transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
