'use client'

import UserAvatarMenu from '@/components/ui/UserAvatarMenu'

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title:     string
  subtitle?: string
  action?:   React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-4 md:px-0 md:pt-0">
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-sage-700 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-sage-700 dark:text-white/70 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {action}
        <UserAvatarMenu />
      </div>
    </div>
  )
}
