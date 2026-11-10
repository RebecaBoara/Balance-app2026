import { NextResponse } from 'next/server'
import admin from '@/lib/firebase-admin'

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the caller's token; checkRevoked rejects tokens of disabled/signed-out users
    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(idToken, true)
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin rights come from the custom claim, which only the Admin SDK can set
    if (decoded.admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { uid } = (await req.json()) as { uid: string }
    if (typeof uid !== 'string' || !uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }
    if (uid === decoded.uid) {
      return NextResponse.json({ error: 'Admins cannot delete their own account here' }, { status: 400 })
    }

    // Delete Firestore data (Admin SDK bypasses security rules)
    const [tasks, moods] = await Promise.all([
      admin.firestore().collection('tasks').where('userId', '==', uid).get(),
      admin.firestore().collection('moods').where('userId', '==', uid).get(),
    ])
    await Promise.all([
      ...tasks.docs.map(d => d.ref.delete()),
      ...moods.docs.map(d => d.ref.delete()),
      admin.firestore().collection('users').doc(uid).delete(),
    ])

    await admin.auth().deleteUser(uid)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('delete-user error', e)
    return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
  }
}
