import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'

const SESSION_EXPIRES_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function POST(req: Request) {
  try {
    const { idToken } = (await req.json()) as { idToken: string }
    if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    })

    const res = NextResponse.json({ status: 'ok' })
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   SESSION_EXPIRES_MS / 1000,
      path:     '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ status: 'ok' })
  res.cookies.set('__session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
  return res
}
