// Сервис-воркер «Ниндзя спорт»: сначала сеть (видны обновления), без интернета — из памяти.
// При выкладке меняй VERSION.
const VERSION = 'ninja-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './planck.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
