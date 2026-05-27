import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { dailyReminder } from '@/inngest/functions/daily-reminder'

export const { GET, POST, PUT } = serve({
  client:    inngest,
  functions: [dailyReminder],
})
