import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'
import { getUserProfile } from '@/lib/db'

export async function DELETE(req: Request) {
  try {
    // Verify the caller is an authenticated admin
    const sessionCookie = req.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('__session='))
      ?.split('=')[1]

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true)
    const callerProfile = await getUserProfile(decoded.uid)
    if (!callerProfile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { uid } = (await req.json()) as { uid: string }
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 })

    await admin.auth().deleteUser(uid)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('delete-user error', e)
    return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
  }
}
