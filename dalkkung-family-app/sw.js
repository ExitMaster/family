const CACHE = 'kkoongs-firebase-v7';
const ASSETS = ['./','./index.html','./styles.css','./v1.1.css','./app.js','./manifest.webmanifest','./assets/icon.svg','./assets/hero-family.svg','./runtime/app-part1.js','./runtime/app-part2.js','./runtime/app-part3.js','./runtime/app-part4.js','./runtime/app-part5.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
])));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/__/')) return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
