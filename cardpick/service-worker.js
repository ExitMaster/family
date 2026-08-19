const CACHE='card-pick-v15';
const ASSETS=[
  './','./index.html','./styles.css','./v2.css','./app-v2.js','./default-data-v2.js','./engine-v2.js','./engine-v2.js?base=1','./engine-v12.js',
  './v12-preload.js','./v12-preapp-extra.js','./v12-details.js','./v12-ui.js','./ui-enhancer-v2.js','./benefit-ui-v2.js','./benefit-details-v2.js','./card-images-v2.js','./v13-links.js','./v14-recording.js','./v15-academy-optimizer.js',
  './assets/cards/samsung-happy-v2.webp','./assets/cards/samsung-lawyers.webp','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))))});