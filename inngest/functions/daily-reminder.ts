import { inngest } from '@/lib/inngest'
import admin from '@/lib/firebase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://balance-mood.co.uk'

export const dailyReminder = inngest.createFunction(
  {
    id:       'daily-reminder',
    name:     'Daily Email Reminder',
    retries:  3,
    // Run every hour — each user's reminderTime is matched against the current UTC hour
    triggers: [{ cron: '0 * * * *' }],
  },
  async ({ step }) => {
    const now = new Date()

    // Step 1: fetch users whose reminder hour matches their local time
    const users = await step.run('fetch-users', async () => {
      const snap = await admin.firestore().collection('users').get()
      return snap.docs
        .filter(d => {
          const data = d.data()
          if (data.emailReminders === false) return false
          // Convert UTC to the user's local timezone (defaults to Europe/London)
          const tz          = (data.timezone as string | undefined) ?? 'Europe/London'
          const localHour   = new Date(now.toLocaleString('en-GB', { timeZone: tz }))
                                .getHours().toString().padStart(2, '0')
          const reminderHour = (data.reminderTime as string | undefined)?.split(':')[0] ?? '08'
          return reminderHour === localHour
        })
        .map(d => d.id)
    })

    let sent   = 0
    let failed = 0

    // Step 2: send one email per user — each is its own retryable step
    for (const uid of users) {
      await step.run(`send-email-${uid}`, async () => {
        const userRecord = await admin.auth().getUser(uid)
        if (!userRecord.email) throw new Error('No email for user ' + uid)

        const firstName = userRecord.displayName?.split(' ')[0] ?? 'there'

        const { error } = await resend.emails.send({
          from:    'Balance <hello@balance-mood.co.uk>',
          to:      userRecord.email,
          subject: 'Time for your daily mood check-in',
          html:    emailHtml(firstName, appUrl),
        })

        if (error) throw new Error(error.message)
      }).then(() => { sent++ }).catch(() => { failed++ })
    }

    return { sent, failed }
  }
)

function emailHtml(firstName: string, url: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf9f7;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">

    <p style="font-size:22px;color:#2d4a35;margin:0 0 4px;font-weight:normal;">
      Good morning, ${firstName}
    </p>
    <p style="font-size:13px;color:#9aada0;margin:0 0 28px;font-family:sans-serif;letter-spacing:0.05em;">
      BALANCE · DAILY CHECK-IN
    </p>

    <p style="font-size:15px;color:#4a6b52;line-height:1.7;margin:0 0 28px;font-family:sans-serif;">
      How are you feeling today? A quick check-in helps Balance recommend
      the right tasks for your energy — so you work with how you feel, not against it.
    </p>

    <a href="${url}/app/mood"
       style="display:inline-block;background:#4a7c59;color:#ffffff;
              padding:13px 28px;border-radius:8px;text-decoration:none;
              font-size:14px;font-family:sans-serif;font-weight:500;">
      Check in now →
    </a>

    <hr style="border:none;border-top:1px solid #e8e4df;margin:36px 0;" />

    <p style="font-size:12px;color:#b0bdb5;line-height:1.6;font-family:sans-serif;margin:0;">
      You're receiving this because you set a daily reminder in Balance.<br>
      <a href="${url}/app/settings" style="color:#b0bdb5;">Change or disable in Settings</a>
    </p>

  </div>
</body>
</html>`
}
