// KYNIO PWA Service Worker (Build 1788816758218)
const CACHE_NAME = 'kynio-pwa-1788816758218';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // HTML or navigation requests: always network-first to guarantee latest app version
  if (req.mode === 'navigate' || req.destination === 'document' || req.url.endsWith('.html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Other assets: Network first, cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
