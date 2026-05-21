import Card from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string | number
  accent?: boolean
  sub?: string
}

export default function StatCard({ label, value, accent = false, sub }: StatCardProps) {
  return (
    <Card
      variant={accent ? 'accent' : 'default'}
      className="p-4 transition-all duration-200 hover:shadow-card animate-fade-in"
    >
      <p className={`text-md font-medium mb-3
                     ${accent ? 'text-white/85' : 'text-sage-700 dark:text-white/80'}`}>
        {label}
      </p>
      <p className={`font-serif text-3xl leading-none
                     ${accent ? 'text-white' : 'text-sage-900 dark:text-white'}`}>
        {value}
      </p>

      {sub && (
        <p className={`text-xs mt-1.5 ${accent ? 'text-white/80' : 'text-sage-700 dark:text-white/70'}`}>
          {sub}
        </p>
      )}
    </Card>
  )
}
