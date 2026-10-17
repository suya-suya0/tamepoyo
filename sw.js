const CACHE_NAME = 'tamepoyo-v3-cache';
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([
    './',
    './index_v3.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './brand-main.png',
    './pose-home.png',
    './pose-ledger.png',
    './pose-wishes.png',
    './pose-shared.png',
    './pose-settings.png'
  ]).catch(() => {})));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(resp => resp || caches.match('./')))
  );
});
