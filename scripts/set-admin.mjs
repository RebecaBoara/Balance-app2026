/**
 * Grant or revoke admin rights for a Balance user via a Firebase custom claim.
 *
 * Custom claims can only be set with the Admin SDK (server-side, using the
 * private key in .env.local), so users can never make themselves admin.
 *
 * Usage (run from the balance-app folder):
 *   node --env-file=.env.local scripts/set-admin.mjs you@example.com
 *   node --env-file=.env.local scripts/set-admin.mjs you@example.com --revoke
 *
 * The user must sign out and back in afterwards for the change to take effect.
 */
import admin from 'firebase-admin'

const email  = process.argv[2]
const revoke = process.argv.includes('--revoke')

if (!email || email.startsWith('--')) {
  console.error('Usage: node --env-file=.env.local scripts/set-admin.mjs <email> [--revoke]')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

try {
  const user = await admin.auth().getUserByEmail(email)
  const claims = { ...(user.customClaims ?? {}) }
  if (revoke) delete claims.admin
  else claims.admin = true

  await admin.auth().setCustomUserClaims(user.uid, claims)
  console.log(`${revoke ? 'Revoked' : 'Granted'} admin for ${email} (uid ${user.uid}).`)
  console.log('Sign out and back in for it to take effect.')
} catch (e) {
  console.error('Failed:', e.message)
  process.exit(1)
}
