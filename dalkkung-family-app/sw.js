const CACHE = 'dalkkung-v1';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/icon.svg','./assets/hero-family.svg','./runtime/app-part1.js','./runtime/app-part2.js','./runtime/app-part3.js','./runtime/app-part4.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
