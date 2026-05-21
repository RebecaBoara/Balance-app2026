import { Lightbulb } from 'lucide-react'
import Card from '@/components/ui/Card'

interface InsightCardProps {
  insight: string
}

export default function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card variant="muted" className="p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        <Lightbulb
          className="w-4 h-4 text-sage-500 dark:text-teal-400 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-semibold text-sage-700 dark:text-white/80
                        uppercase tracking-wider mb-1.5">
            Weekly insight
          </p>
          <p className="text-sm text-sage-700 dark:text-white/70 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </Card>
  )
}
