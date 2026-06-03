import type { Metadata } from 'next'
import ThemeProvider from '@/components/layout/ThemeProvider'
import { ToastProvider } from '@/components/ui/Toaster'
import './globals.css'

export const metadata: Metadata = {
  title:       'Balance — Productivity & Wellbeing',
  description: 'An emotion-aware task planner that recommends the right tasks based on how you feel.',
  icons: { icon: '/lotus.PNG' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('balance-theme');
              var dark  = theme === 'dark' ||
                (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (dark) document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-warm-100 dark:bg-ocean-900 text-sage-900 dark:text-white antialiased">
        <ThemeProvider><ToastProvider>{children}</ToastProvider></ThemeProvider>
      </body>
    </html>
  )
}