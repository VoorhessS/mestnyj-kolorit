// Сервис-воркер «Панельки»: сначала сеть (видны обновления), без интернета — из памяти.
// При выкладке меняй VERSION.
const VERSION = 'panelka-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './fonts/rubik-cyr.woff2', './fonts/rubik-lat.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const fromCache = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
  // плохой интернет: ждём сеть не дольше 3 с, потом берём из памяти
  const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); } return r; });
  const slow = new Promise(res => setTimeout(res, 3000)).then(() => caches.match(e.request, { ignoreSearch: true })).then(r => r || net);
  e.respondWith(Promise.race([net, slow]).then(r => (r && r.ok) ? r : fromCache().then(c => c || r)).catch(fromCache));
});
