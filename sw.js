// Сервис-воркер: запоминает игру в телефоне, чтобы она открывалась без интернета.
// При каждом выкладывании меняй VERSION — тогда телефон скачает свежую версию.
const VERSION = 'kolorit-v37';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './fonts/pixel-cyr.woff2', './fonts/pixel-lat.woff2', './fonts/ruslan-cyr.woff2', './fonts/ruslan-lat.woff2',
  './fonts/rubik-cyr.woff2', './fonts/rubik-lat.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Сначала сеть (чтобы видеть обновления), без сети — из памяти
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
