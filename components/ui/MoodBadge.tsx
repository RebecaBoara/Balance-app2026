
import { MoodType } from '@/types'
import { getMoodEmoji, getMoodLabel } from '@/lib/mood'

const STYLES: Record<MoodType, string> = {
  exhausted: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  stressed:  'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  neutral:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  good:      'bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300',
  energised: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
}

export default function MoodBadge({ mood }: { mood: MoodType }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium
                      px-3 py-1 rounded-full ${STYLES[mood]}`}>
      <span aria-hidden="true">{getMoodEmoji(mood)}</span>
      {getMoodLabel(mood)}
    </span>
  )
}