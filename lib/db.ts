// lib/db.ts
// Firestore database operations for Balance app

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc,  query, where, orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import { Task, MoodEntry, DifficultyType, MoodType, RepeatType, UserProfile } from '@/types'


//USER PROFILE 
export async function getUserProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? (snap.data() as Partial<UserProfile>) : null
}
 
export async function saveUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> {
  // merge: true — only updates fields passed in, never overwrites whole document
  await setDoc(doc(db, 'users', userId), data, { merge: true })
}
 
export async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string
): Promise<void> {
  // Only creates if doesn't exist yet — safe to call on every login
  const existing = await getUserProfile(userId)
  if (existing) return
 
  await setDoc(doc(db, 'users', userId), {
    uid:              userId,
    email,
    displayName:      displayName || '',
    reminderTime:     '08:00',
    reminders:        true,
    breakSuggestions: true,
    theme:            'system',
    createdAt:        Date.now(),
    hasOnboarded:     false,
  })
}
 

//  TASKS
export async function getTasks(userId: string): Promise<Task[]> {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))
}

export async function addTask(
  userId: string,
  title: string,
  difficulty: DifficultyType,
  priority: boolean = false,
  estimatedMin: number,
  repeat: RepeatType = 'none',
  dueDate?: string,
  dueTime?: string,
  notes?: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'tasks'), {
    userId,
    title,
    difficulty,
    priority,
    estimatedMin,
    repeat,
    dueDate:   dueDate || null,
    dueTime:   dueTime || null,
    notes:     notes   || null,
    completed: false,
    createdAt: Date.now(),
  })
  return ref.id
}

export async function updateTask(
  taskId: string,
  data: { title: string; difficulty: DifficultyType; priority?: boolean; estimatedMin: number; repeat?: RepeatType; dueDate?: string; dueTime?: string; notes?: string }
): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), {
    title:        data.title,
    difficulty:   data.difficulty,
    priority:     data.priority ?? false,
    estimatedMin: data.estimatedMin,
    repeat:       data.repeat  || 'none',
    dueDate:      data.dueDate || null,
    dueTime:      data.dueTime || null,
    notes:        data.notes   || null,
  })
}

export async function toggleTask(taskId: string, completed: boolean): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), {
    completed,
    completedAt: completed ? Date.now() : null,
  })
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId))
}

export async function deleteUserData(userId: string): Promise<void> {
  // Delete user profile
  await deleteDoc(doc(db, 'users', userId))

  // Delete all tasks
  const tasks = await getDocs(query(collection(db, 'tasks'), where('userId', '==', userId)))
  await Promise.all(tasks.docs.map(d => deleteDoc(d.ref)))

  // Delete all mood entries
  const moods = await getDocs(query(collection(db, 'moods'), where('userId', '==', userId)))
  await Promise.all(moods.docs.map(d => deleteDoc(d.ref)))
}

//  MOOD ENTRIES

export async function saveMoodEntry(
  userId: string,
  mood: MoodType,
  note?: string,
  aiSpark?: string,
  aiSuggestion?: string,
): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  const q = query(
    collection(db, 'moods'),
    where('userId', '==', userId),
    where('date', '==', today)
  )
  const existing = await getDocs(q)

  if (!existing.empty) {
    const docId = existing.docs[0].id
    await updateDoc(doc(db, 'moods', docId), {
      mood,
      note: note || '',
      ...(aiSpark       && { aiSpark }),
      ...(aiSuggestion  && { aiSuggestion }),
    })
    return docId
  }

  const ref = await addDoc(collection(db, 'moods'), {
    userId,
    mood,
    note:      note || '',
    date:      today,
    createdAt: Date.now(),
    ...(aiSpark       && { aiSpark }),
    ...(aiSuggestion  && { aiSuggestion }),
  })
  return ref.id
}

export async function getMoodHistory(
  userId: string,
  days: number = 7
): Promise<MoodEntry[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const q = query(
    collection(db, 'moods'),
    where('userId', '==', userId),
    where('date', '>=', cutoffStr),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodEntry))
}

export async function getTodaysMood(userId: string): Promise<MoodEntry | null> {
  const today = new Date().toISOString().split('T')[0]
  const q = query(
    collection(db, 'moods'),
    where('userId', '==', userId),
    where('date', '==', today)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as MoodEntry
}

// DASHBOARD STATS 
export async function getDashboardStats(userId: string) {
  const [tasks, moods] = await Promise.all([
    getTasks(userId),
    getMoodHistory(userId, 7),
  ])

  const completed   = tasks.filter(t => t.completed)
  const total       = tasks.length
  const rate        = total > 0 ? Math.round((completed.length / total) * 100) : 0

  // Most common mood this week
  const moodCounts = moods.reduce((acc, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType | null

  // Streak calculation
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (moods.some(m => m.date === dateStr)) {
      streak++
    } else {
      break
    }
  }

  return {
    tasksCompleted:   completed.length,
    completionRate:   rate,
    checkInsThisWeek: moods.length,
    topMood,
    moodHistory:      moods.map(m => ({ date: m.date, mood: m.mood, note: m.note || '' })),
    streak,
    incompleteTasks:  tasks.filter(t => !t.completed),
  }
}
