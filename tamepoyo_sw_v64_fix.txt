// tamepoyo service worker - v6.4 cache fix
const CACHE_NAME = 'tamepoyo-v64-fix2';
const CORE_FILES = ['./index_v64.html', './tamepoyo_v64.js'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Missing optional files must not prevent service-worker installation.
      await Promise.all(CORE_FILES.map(async path => {
        try {
          const response = await fetch(path, {cache: 'no-store'});
          if (response.ok) await cache.put(path, response);
        } catch (error) {
          console.warn('PWA cache skipped:', path, error);
        }
      }));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('tamepoyo-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, {cache: 'no-store'});
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
