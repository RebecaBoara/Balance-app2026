import { DifficultyType } from '@/types'

const STYLES: Record<DifficultyType, string> = {
  easy:   'bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300',
  medium: 'bg-amber-pale dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
  hard:   'bg-coral-pale dark:bg-coral-app/20 text-red-800 dark:text-coral-pale',
}

const LABELS: Record<DifficultyType, string> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
}

export default function DifficultyBadge({ difficulty }: { difficulty: DifficultyType }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STYLES[difficulty]}`}>
      {LABELS[difficulty]}
    </span>
  )
}