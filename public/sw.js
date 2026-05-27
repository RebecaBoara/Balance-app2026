// Empty service worker — Balance does not use a service worker.
// This file exists only to prevent 404 errors from browsers
// that have a stale registration cached from a previous session.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.registration.unregister())
