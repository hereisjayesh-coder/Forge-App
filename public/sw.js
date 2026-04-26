const CACHE_NAME = 'forge-cache-v1';
const URLS_TO_CACHE = [
   '/',
   '/index.html',
   '/manifest.json'
];

self.addEventListener('install', (event) => {
   event.waitUntil(
      caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(URLS_TO_CACHE))
   );
   self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
   // Simple network-first strategy for dynamic app
   event.respondWith(
      fetch(event.request).catch(() => {
         return caches.match(event.request);
      })
   );
});

self.addEventListener('activate', (event) => {
   const cacheWhitelist = [CACHE_NAME];
   event.waitUntil(
      caches.keys().then((cacheNames) => {
         return Promise.all(
            cacheNames.map((cacheName) => {
               if (!cacheWhitelist.includes(cacheName)) {
                  return caches.delete(cacheName);
               }
            })
         );
      })
   );
   self.clients.claim();
});
