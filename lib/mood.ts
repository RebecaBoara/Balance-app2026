
// Core emotion-aware recommendation logic for Balance
import { MoodType, DifficultyType, MoodRecommendation, Task } from '@/types'


export const MOOD_CONFIG: Record<MoodType, MoodRecommendation> = {
  exhausted: {
    mood:              'exhausted',
    emoji:             '😴',
    label:             'Exhausted',
    colour:            'purple',
    maxTasks:          3,
    allowedDifficulty: ['easy'],
    suggestion:        "You seem tired today. Start with just 3 easy tasks and take a break every 25 minutes.",
    breakSuggestion:   "Try 15 minutes on, 10 minutes off today. Rest is productive.",
    sparkMessage:      "It's okay to take it slow today. Three small wins is a great day.",
  },
  stressed: {
    mood:              'stressed',
    emoji:             '😟',
    label:             'Stressed',
    colour:            'coral',
    maxTasks:          4,
    allowedDifficulty: ['easy'],
    suggestion:        "You seem stressed. Only light tasks today — no new deadlines. A 5-minute breathing break might help.",
    breakSuggestion:   "Take a 5-minute breathing break between each task. Your wellbeing comes first.",
    sparkMessage:      "Stress is temporary. Focus on one small thing at a time.",
  },
  neutral: {
    mood:              'neutral',
    emoji:             '😐',
    label:             'Neutral',
    colour:            'amber',
    maxTasks:          5,
    allowedDifficulty: ['easy', 'medium'],
    suggestion:        "A steady day ahead. A balanced mix of easy and medium tasks will keep things moving.",
    breakSuggestion:   "Take a short break after every two tasks to maintain focus.",
    sparkMessage:      "Steady progress is still progress. Keep going.",
  },
  good: {
    mood:              'good',
    emoji:             '🙂',
    label:             'Good',
    colour:            'sage',
    maxTasks:          6,
    allowedDifficulty: ['easy', 'medium', 'hard'],
    suggestion:        "You're in a good place today. Your full task list is unlocked — tackle something meaningful.",
    breakSuggestion:   "You're flowing well. Take a break when you feel it, not on a timer.",
    sparkMessage:      "Great days like this are when the best work happens. Make the most of it.",
  },
  energised: {
    mood:              'energised',
    emoji:             '😄',
    label:             'Energised',
    colour:            'sky',
    maxTasks:          8,
    allowedDifficulty: ['easy', 'medium', 'hard'],
    suggestion:        "You're at your peak! Hard and ambitious tasks are surfaced first — this is your moment.",
    breakSuggestion:   "You're in flow. Short breaks every 90 minutes will sustain this energy.",
    sparkMessage:      "You've got everything you need today. Go make something remarkable.",
  },
}

// Core recommendation function
// Takes current mood and full task list, returns prioritised tasks
export function getRecommendedTasks(mood: MoodType, tasks: Task[]): {
  recommended: Task[]
  deferred:    Task[]
} {
  const config = MOOD_CONFIG[mood]
  const incomplete = tasks.filter(t => !t.completed)

  // Split tasks by whether they're allowed for this mood
  const allowed  = incomplete.filter(t => config.allowedDifficulty.includes(t.difficulty))
  const deferred = incomplete.filter(t => !config.allowedDifficulty.includes(t.difficulty))

  // Neutral: no reordering — tasks stay in their natural creation order.
  // Low-energy moods: easy first. High-energy moods: hard first.
  const highEnergy = mood === 'good' || mood === 'energised'
  const lowEnergy  = mood === 'exhausted' || mood === 'stressed'

  const sorted = (lowEnergy || highEnergy)
    ? [...allowed].sort((a, b) => {
        const diffOrder: Record<DifficultyType, number> = highEnergy
          ? { hard: 0, medium: 1, easy: 2 }
          : { easy: 0, medium: 1, hard: 2 }
        if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
          return diffOrder[a.difficulty] - diffOrder[b.difficulty]
        }
        return a.createdAt - b.createdAt
      })
    : allowed

  // Neutral: no cap — show all easy/medium tasks, only hard tasks deferred.
  if (mood === 'neutral') {
    return { recommended: sorted, deferred }
  }

  return {
    recommended: sorted.slice(0, config.maxTasks),
    deferred:    [...sorted.slice(config.maxTasks), ...deferred],
  }
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