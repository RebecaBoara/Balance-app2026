// All TypeScript types for Balance app

export type MoodType = 'exhausted' | 'stressed' | 'neutral' | 'good' | 'energised'
export type DifficultyType = 'easy' | 'medium' | 'hard'
export type PriorityType = 'high' | 'medium' | 'low'
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface MoodEntry {
  id:           string
  userId:       string
  mood:         MoodType
  note?:        string
  date:         string   // ISO date string YYYY-MM-DD
  createdAt:    number   // timestamp
  aiSpark?:     string   // AI-generated daily spark quote
  aiSuggestion?: string  // AI-generated balance suggests message
}

export interface Task {
  id:          string
  userId:      string
  title:       string
  difficulty:  DifficultyType
  estimatedMin: number
  priority?:   PriorityType
  repeat?:     RepeatType
  completed:   boolean
  dueDate?:    string  // optional ISO date YYYY-MM-DD
  dueTime?:    string  // optional ISO time HH:mm
  notes?:      string
  createdAt:   number
  completedAt?: number
}

export interface MoodRecommendation {
  mood:           MoodType
  emoji:          string
  label:          string
  colour:         string // Tailwind class
  suggestion:     string
  breakSuggestion: string
  sparkMessage:   string
}

export interface DashboardStats {
  tasksCompleted:   number
  completionRate:   number
  checkInsThisWeek: number
  topMood:          MoodType | null
  moodHistory:      { date: string; mood: MoodType }[]
  streak:           number
}

export interface UserProfile {
  uid:              string
  email:            string
  displayName?:     string
  reminderTime:     string
  reminders:        boolean
  breakSuggestions: boolean
  emailReminders:   boolean
  theme:            'light' | 'dark' | 'system'
  createdAt:        number
  isAdmin?:         boolean
  hasOnboarded?:    boolean
}

export interface DailyAIMessage {
  spark:      string
  suggestion: string
}
