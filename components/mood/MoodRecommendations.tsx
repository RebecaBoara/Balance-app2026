'use client'


// Shows mood-specific recommendations on the mood check-in screen
// Includes:
//   - Music playlist links (calm for low moods, upbeat for high)
//   - Activity suggestions per mood
//   - Mental health resources for low moods (Exhausted / Stressed)


import { MoodType } from '@/types'
import { Music, Activity, Heart, ExternalLink } from 'lucide-react'

// ─Music recommendations per mood ─
const MUSIC: Record<MoodType, {
  label:       string
  description: string
  playlists:   { name: string; url: string; source: string }[]
}> = {
  exhausted: {
    label:       'Calm & restorative',
    description: 'Gentle music to help you rest and recharge',
    playlists: [
      { name: 'Peaceful Piano',    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO', source: 'Spotify' },
      { name: 'Sleep & Relaxation', url: 'https://www.youtube.com/results?search_query=relaxing+sleep+music', source: 'YouTube' },
      { name: 'Nature Sounds',     url: 'https://www.youtube.com/results?search_query=nature+sounds+relaxation', source: 'YouTube' },
    ],
  },
  stressed: {
    label:       'Calming & grounding',
    description: 'Music to ease anxiety and quiet a busy mind',
    playlists: [
      { name: 'Stress Relief',     url: 'https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP', source: 'Spotify' },
      { name: 'Lofi Study Beats',  url: 'https://www.youtube.com/results?search_query=lofi+hip+hop+study', source: 'YouTube' },
      { name: 'Meditation Music',  url: 'https://www.youtube.com/results?search_query=meditation+music+anxiety', source: 'YouTube' },
    ],
  },
  neutral: {
    label:       'Steady focus',
    description: 'Background music to keep you productive and calm',
    playlists: [
      { name: 'Focus Flow',        url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ', source: 'Spotify' },
      { name: 'Instrumental Study', url: 'https://www.youtube.com/results?search_query=instrumental+study+music', source: 'YouTube' },
      { name: 'Ambient Work',      url: 'https://www.youtube.com/results?search_query=ambient+music+productivity', source: 'YouTube' },
    ],
  },
  good: {
    label:       'Uplifting & energising',
    description: 'Feel-good music to keep your momentum going',
    playlists: [
      { name: 'Happy Hits',        url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC', source: 'Spotify' },
      { name: 'Feel Good Indie',   url: 'https://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL', source: 'Spotify' },
      { name: 'Upbeat Pop',        url: 'https://www.youtube.com/results?search_query=upbeat+pop+playlist+2024', source: 'YouTube' },
    ],
  },
  energised: {
    label:       'High energy & motivating',
    description: 'Power music for peak performance and deep focus',
    playlists: [
      { name: 'Workout Beats',     url: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP', source: 'Spotify' },
      { name: 'Power Hour',        url: 'https://open.spotify.com/playlist/37i9dQZF1DX0jgyAiPl8Af', source: 'Spotify' },
      { name: 'Epic Focus Music',  url: 'https://www.youtube.com/results?search_query=epic+focus+music+productivity', source: 'YouTube' },
    ],
  },
}

//Activity suggestions per mood 
const ACTIVITIES: Record<MoodType, {
  label:      string
  items:      string[]
}> = {
  exhausted: {
    label: 'Gentle activities',
    items: [
      'Take a 20-minute power nap',
      'A slow 10-minute walk outside',
      '5 minutes of gentle stretching',
      'Make a warm drink and rest quietly',
      'Read something light and enjoyable',
    ],
  },
  stressed: {
    label: 'Calming activities',
    items: [
      'Try 4-7-8 breathing (inhale 4, hold 7, exhale 8)',
      'Write down what\'s on your mind — then close the notebook',
      'Take a warm shower or bath',
      'Step outside for fresh air, even for 5 minutes',
      'Talk to someone you trust',
    ],
  },
  neutral: {
    label: 'Productive activities',
    items: [
      'Tidy your workspace before starting',
      'Try a 25-minute Pomodoro session',
      'Review and organise your task list',
      'Tackle one medium-difficulty task',
      'Drink a glass of water and take a short stretch',
    ],
  },
  good: {
    label: 'Momentum activities',
    items: [
      'Pick your most important task and start now',
      'Have a conversation you\'ve been putting off',
      'A brisk walk or light exercise to maintain energy',
      'Write, plan, or create something meaningful',
      'Learn something new — read an article or watch a tutorial',
    ],
  },
  energised: {
    label: 'Peak performance activities',
    items: [
      'Tackle your hardest or most ambitious task first',
      'Go for a run, gym session, or intense workout',
      'Create or build something you\'ve been excited about',
      'Make important decisions while your mind is sharp',
      'Lead a meeting, collaborate, or teach someone something',
    ],
  },
}

//Mental health resources (low moods only) 
const MENTAL_HEALTH_RESOURCES = [
  {
    name:        'Mind',
    description: 'Mental health charity — information, advice and local support',
    url:         'https://www.mind.org.uk',
    phone:       '0300 123 3393',
  },
  {
    name:        'Samaritans',
    description: 'Available 24/7 if you need someone to talk to',
    url:         'https://www.samaritans.org',
    phone:       '116 123 (free)',
  },
  {
    name:        'NHS Every Mind Matters',
    description: 'Expert advice and practical tips to improve mental wellbeing',
    url:         'https://www.nhs.uk/every-mind-matters',
    phone:       null,
  },
  {
    name:        'Student Minds',
    description: 'Mental health support specifically for students',
    url:         'https://www.studentminds.org.uk',
    phone:       null,
  },
]

// Main component
interface MoodRecommendationsProps {
  mood: MoodType
}

export default function MoodRecommendations({ mood }: MoodRecommendationsProps) {
  const music      = MUSIC[mood]
  const activities = ACTIVITIES[mood]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">

      {/* Activities*/}
      <div className="bg-white dark:bg-ocean-900 rounded-sm  dark:border-ocean-600 overflow-hidden shadow-raised animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-sage-500/10 dark:border-ocean-600">
          <Activity className="w-4 h-4 text-sage-800 dark:text-white/60" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider text-sage-700 dark:text-white/60">
            {activities.label}
          </span>
        </div>
        <ul className="px-4 py-3 space-y-2">
          {activities.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-sage-700 dark:text-white/70 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sage-300 dark:bg-white/30 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Music */}
      <div className="bg-white dark:bg-ocean-900 rounded-sm  dark:border-ocean-600 overflow-hidden shadow-raised animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-sage-500/10 dark:border-ocean-600">
          <Music className="w-4 h-4 text-sage-700 dark:text-white/60" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wider text-sage-700 dark:text-white/60">
            {music.label}
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-sage-800 dark:text-white/50 mb-3">{music.description}</p>
          <div className="space-y-2">
            {music.playlists.map(({ name, url, source }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg
                           bg-sage-50 dark:bg-ocean-800
                           hover:bg-sage-100 dark:hover:bg-ocean-700
                           transition-colors group"
              >
                <span className="text-sm text-sage-700 dark:text-white/70 font-medium">{name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-sage-500 dark:text-white/40">{source}</span>
                  <ExternalLink
                    className="w-3 h-3 text-sage-500 group-hover:text-sage-500
                               dark:text-white/40 dark:group-hover:text-teal-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export function MoodSupportCard() {
  return (
    <div className="bg-white dark:bg-ocean-900 rounded-sm  dark:border-ocean-600 overflow-hidden shadow-raised animate-fade-in mb-5">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sage-500/10 dark:border-ocean-600">
        <Heart className="w-4 h-4 text-green-500 dark:text-green-400" aria-hidden="true" />
        <span className="text-sm font-semibold uppercase tracking-wider text-sage-700 dark:text-white/60">
          You don't have to face this alone
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-sage-800 dark:text-white/70 mb-3 leading-relaxed">
          It&apos;s okay to not be okay. If you&apos;re struggling, these free resources are here to help.
        </p>
        <div className="space-y-2">
          {MENTAL_HEALTH_RESOURCES.map(({ name, description, url, phone }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between p-3 rounded-lg
                         bg-sage-50 dark:bg-ocean-800
                         hover:bg-sage-100 dark:hover:bg-ocean-700
                         transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-semibold text-sage-800 dark:text-white mb-0.5">{name}</p>
                <p className="text-xs text-sage-500 dark:text-white/70 leading-relaxed">{description}</p>
                {phone && (
                  <p className="text-xs text-sage-600 dark:text-teal-400 font-medium mt-1">📞 {phone}</p>
                )}
              </div>
              <ExternalLink
                className="w-3.5 h-3.5 text-sage-500 group-hover:text-sage-500
                           dark:text-ocean-500 dark:group-hover:text-teal-400
                           transition-colors flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
        <p className="text-xs text-sage-500 dark:text-white/40 mt-3 leading-relaxed text-center">
          Resources listed are UK-based. Outside the UK? Search for a local mental health helpline in your country.
          Balance is not a mental health tool. If you are in crisis, please contact Samaritans on 116 123 (free, 24/7).
        </p>
      </div>
    </div>
  )
}