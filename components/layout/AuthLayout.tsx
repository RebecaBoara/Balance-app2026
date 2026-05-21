import Logo from '@/components/ui/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-100 dark:bg-ocean-900 flex flex-col">
      <div className="p-6">
        <Logo size="md" />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
