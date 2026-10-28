// Sky Coin Rush moved to ../sky-a-c/. This worker replaces the old one, clears its cache
// and unregisters itself, so the old address just redirects.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('sky-coin-rush')) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));
