
// Layout wrapper for all protected app screens
// Applies AuthProvider to every screen under /app/*

import AuthProvider from '@/components/layout/Authprovider'
import AppShell    from '@/components/layout/AppShell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppShell>
        {children}
      </AppShell>
    </AuthProvider>
  )
}