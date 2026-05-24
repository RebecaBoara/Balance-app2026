import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const snap = await admin.firestore().collection('users').get()

  const targets = snap.docs.filter(doc => doc.data().emailReminders !== false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const results = await Promise.allSettled(
    targets.map(async doc => {
      const userRecord = await admin.auth().getUser(doc.id)
      if (!userRecord.email) throw new Error('No email')

      const { error } = await resend.emails.send({
        from:    'Balance <onboarding@resend.dev>',
        to:      userRecord.email,
        subject: 'Time for your daily mood check-in',
        html:    emailHtml(userRecord.displayName?.split(' ')[0] ?? 'there', appUrl),
      })
      if (error) throw new Error(error.message)
    })
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ sent, failed })
}

function emailHtml(firstName: string, appUrl: string): string {
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

    <a href="${appUrl}/app/mood"
       style="display:inline-block;background:#4a7c59;color:#ffffff;
              padding:13px 28px;border-radius:8px;text-decoration:none;
              font-size:14px;font-family:sans-serif;font-weight:500;">
      Check in now →
    </a>

    <hr style="border:none;border-top:1px solid #e8e4df;margin:36px 0;" />

    <p style="font-size:12px;color:#b0bdb5;line-height:1.6;font-family:sans-serif;margin:0;">
      You're receiving this because you set a daily reminder in Balance.<br>
      <a href="${appUrl}/app/settings" style="color:#b0bdb5;">Change or disable in Settings</a>
    </p>

  </div>
</body>
</html>`
}
