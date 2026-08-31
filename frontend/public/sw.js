// sw.js — Robert Evan's Plumbing & Electrician PWA service worker.
// Deliberately hand-written (no Workbox/vite-plugin-pwa) so it has zero
// extra build-time dependencies: it's plain, valid JS that runs as-is once
// Vite copies it from /public to the build output. It does two things:
//   1. Caches a tiny app shell so the installed app opens even if the
//      network is briefly unavailable.
//   2. Listens for Web Push events and shows a real OS notification —
//      this fires even if no tab/window is open.

const CACHE_NAME = 'robert-evans-shell-v1';
const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for same-origin page requests, falling back to the cached
// shell when offline. Never touches /api/ calls or cross-origin requests —
// those should always hit the network directly.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Robert Evan's Plumbing & Electrician",
      body: event.data ? event.data.text() : 'You have a new message.',
    };
  }

  const title = data.title || "Robert Evan's Plumbing & Electrician";
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'plumbing-message',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          if ('navigate' in client) client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
