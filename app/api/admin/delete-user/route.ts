import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify caller and check isAdmin via Firebase custom claims or Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken)

    // Read isAdmin from Firestore using Admin SDK (bypasses client-side rules)
    const profileSnap = await admin.firestore().collection('users').doc(decoded.uid).get()
    if (!profileSnap.exists || !profileSnap.data()?.isAdmin) {
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
