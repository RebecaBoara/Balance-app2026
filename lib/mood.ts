
// Core emotion-aware recommendation logic for Balance
import { MoodType, DifficultyType, PriorityType, MoodRecommendation, Task } from '@/types'


export const MOOD_CONFIG: Record<MoodType, MoodRecommendation> = {
  exhausted: {
    mood:            'exhausted',
    emoji:           '😴',
    label:           'Exhausted',
    colour:          'purple',
    suggestion:      "You're doing enough. Start with just one small task to build momentum — even one thing crossed off makes the day count. Be kind to yourself.",
    breakSuggestion: "Try 15 minutes on, 10 minutes off. Protect your energy while still moving forward.",
    sparkMessage:    "It's okay to take it slow today. One step at a time is still forward.",
  },
  stressed: {
    mood:            'stressed',
    emoji:           '😟',
    label:           'Stressed',
    colour:          'coral',
    suggestion:      "Take a breath. Pick one task, give it your full attention, then move to the next. You've handled hard days before — this one is no different.",
    breakSuggestion: "Short breaks between tasks reset your focus. Even 2–3 minutes helps.",
    sparkMessage:    "Stress is temporary. Focus on one thing at a time and keep moving.",
  },
  neutral: {
    mood:            'neutral',
    emoji:           '😐',
    label:           'Neutral',
    colour:          'amber',
    suggestion:      "A steady day ahead. A balanced mix of easy and medium tasks will keep things moving.",
    breakSuggestion: "Take a short break after every two tasks to maintain focus.",
    sparkMessage:    "Steady progress is still progress. Keep going.",
  },
  good: {
    mood:            'good',
    emoji:           '🙂',
    label:           'Good',
    colour:          'sage',
    suggestion:      "You're in a good place today. Your full task list is unlocked — tackle something meaningful.",
    breakSuggestion: "You're flowing well. Take a break when you feel it, not on a timer.",
    sparkMessage:    "Great days like this are when the best work happens. Make the most of it.",
  },
  energised: {
    mood:            'energised',
    emoji:           '😄',
    label:           'Energised',
    colour:          'sky',
    suggestion:      "You're at your peak! Hard and ambitious tasks are surfaced first — this is your moment.",
    breakSuggestion: "You're in flow. Short breaks every 90 minutes will sustain this energy.",
    sparkMessage:    "You've got everything you need today. Go make something remarkable.",
  },
}

// Core recommendation function
// Takes current mood and full task list, returns prioritised tasks
export function getRecommendedTasks(mood: MoodType, tasks: Task[]): {
  recommended: Task[]
  deferred:    Task[]
} {
  const incomplete = tasks.filter(t => !t.completed)
  const today      = new Date().toISOString().split('T')[0]

  const isUrgent = (t: Task) =>
    t.dueDate && (t.dueDate <= today)

  const effectivePriority = (t: Task): number => {
    const p = t.priority ?? 'medium'
    return p === 'high' ? 0 : p === 'medium' ? 1 : 2
  }

  if (mood === 'exhausted' || mood === 'stressed') {
    // Bucket 1: high-priority or due today/overdue (any difficulty) — must-do first
    const mustDo  = incomplete.filter(t =>
      t.priority === 'high' || isUrgent(t)
    )
    // Bucket 2: easy tasks that aren't already in mustDo
    const mustIds = new Set(mustDo.map(t => t.id))
    const easy    = incomplete.filter(t => !mustIds.has(t.id) && t.difficulty === 'easy')
    // Deferred: low-priority medium/hard tasks not due today
    const deferred = incomplete.filter(t =>
      !mustIds.has(t.id) && !easy.find(e => e.id === t.id)
    )

    const sortByPriorityThenDate = (a: Task, b: Task) =>
      effectivePriority(a) - effectivePriority(b) || a.createdAt - b.createdAt

    return {
      recommended: [
        ...mustDo.sort(sortByPriorityThenDate),
        ...easy.sort(sortByPriorityThenDate),
      ],
      deferred: deferred.sort(sortByPriorityThenDate),
    }
  }

  if (mood === 'neutral') {
    // Easy + medium shown, hard deferred — no reordering, natural creation order
    const allowed  = incomplete.filter(t => t.difficulty !== 'hard')
    const deferred = incomplete.filter(t => t.difficulty === 'hard')
    return { recommended: allowed, deferred }
  }

  // good / energised — all tasks shown, hard + high-priority first
  const diffOrder: Record<DifficultyType, number> = { hard: 0, medium: 1, easy: 2 }
  const sorted = [...incomplete].sort((a, b) => {
    if (effectivePriority(a) !== effectivePriority(b))
      return effectivePriority(a) - effectivePriority(b)
    if (diffOrder[a.difficulty] !== diffOrder[b.difficulty])
      return diffOrder[a.difficulty] - diffOrder[b.difficulty]
    return a.createdAt - b.createdAt
  })

  return { recommended: sorted, deferred: [] }
}

//Mood display helpers
export function getMoodConfig(mood: MoodType): MoodRecommendation {
  return MOOD_CONFIG[mood]
}

export function getMoodEmoji(mood: MoodType): string {
  return MOOD_CONFIG[mood].emoji
}

export function getMoodLabel(mood: MoodType): string {
  return MOOD_CONFIG[mood].label
}

// Difficulty helpers 
export const DIFFICULTY_CONFIG: Record<DifficultyType, {
  label: string
  colour: string
  textColour: string
}> = {
  easy:   { label: 'Easy',   colour: 'bg-sage-50 dark:bg-sage-900/20',   textColour: 'text-sage-700 dark:text-sage-300' },
  medium: { label: 'Medium', colour: 'bg-amber-pale dark:bg-amber-900/20', textColour: 'text-amber-700 dark:text-amber-300' },
  hard:   { label: 'Hard',   colour: 'bg-coral-pale dark:bg-red-900/20',  textColour: 'text-coral-700 dark:text-red-300' },
}

// Daily spark messages (shown on mood check-in)
export const SPARK_MESSAGES: Record<MoodType, string[]> = {
  exhausted: [
    "Rest is not giving up — it's part of the process.",
    "Even small steps forward count. Be kind to yourself today.",
    "Focus on just 3 easy wins today. You've got this.",
    "Small wins build momentum. Celebrate them.",
    "You're doing better than you think. Keep going.",
    "You're stronger than you think. Keep going.",
    

  ],
  stressed: [
    "One thing at a time. You don't have to do everything today.",
    "Breathe. The most important task is staying well.",
    "Progress over perfection — always.",
    "It's okay to ask for help if things feel overwhelming.",
    "Remember why you do what you do. Focus on one meaningful thing today.",
    "Your wellbeing is the foundation for everything else. Take care of it.",
  ],
  neutral: [
    "Steady progress is still progress. Keep going.",
    "Today is a good day to do good work.",
    "Consistency beats intensity every time.",

  ],
  good: [
    "Great days like this are when the best work happens.",
    "You're in a great place — make the most of it.",
    "Channel this energy into something meaningful today.",
    "You're capable of achieving great things today.",

  ],
  energised: [
    "You've got everything you need today. Go make something remarkable.",
    "Peak energy — prioritise your hardest and most important tasks.",
    "Days like this don't come every day. Make it count.",

  ],
}

export function getDailySparkMessage(mood: MoodType): string {
  const messages = SPARK_MESSAGES[mood]
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return messages[dayOfYear % messages.length]
}

const GENERAL_SPARKS = [
  "Every day is a fresh start. You've got this.",
  "Small steps taken consistently lead to big changes.",
  "You don't have to do everything today — just the next right thing.",
  "Your effort today is shaping the version of you tomorrow.",
  "Progress, not perfection. That's what counts.",
  "Today is full of possibility. Begin.",
  "Even on hard days, showing up matters more than you know.",
  "Be kind to yourself today — you're doing better than you think.",
  "One task at a time. One moment at a time. You've got it.",
  "The way you start your day shapes everything that follows.",
  "You have everything you need to make today a good one.",
  "Gentle beginnings lead to great endings.",
  "Take a breath. You're exactly where you need to be.",
  "Whatever today holds, you are more capable than you feel.",
  "Good things take time. Keep going.",
]

export function getDailyGeneralSpark(): string {
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return GENERAL_SPARKS[dayOfYear % GENERAL_SPARKS.length]
}