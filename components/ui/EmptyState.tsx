
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon:         string
  title:        string
  description:  string
  action?:      React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center
                    text-center py-16 px-6">
      <span className="text-4xl mb-4" aria-hidden="true">{icon}</span>
      <h3 className="font-serif text-xl text-sage-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-sage-700 dark:text-white/70 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action}
    </div>
  )
}