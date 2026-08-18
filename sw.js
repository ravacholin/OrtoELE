// ORTOGRAFÍA LAB — Service Worker (Offline Support & PWA Cache)
const CACHE_NAME = 'orto-lab-cache-v1.2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'
];

// Install Event: Cache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell and core assets...');
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Could not cache resource on install:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache version:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First for APIs, Stale-While-Revalidate for Static Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API Calls (/api/*): Network-first with offline JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          console.log('[SW] Serving offline API fallback for:', url.pathname);
          return new Response(
            JSON.stringify({
              isOffline: true,
              message: 'Modo sin conexión activo. Las sesiones locales se guardan y procesan en tu dispositivo.',
              feedback: 'Evaluación local activa. Tu progreso se sincronizará automáticamente.',
              codes: ['[ORT]'],
              question: 'Revisá la ortografía de la palabra en base a su familia léxica y las normas estudiadas.'
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        })
    );
    return;
  }

  // 2. Navigation / HTML Requests: Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match('/index.html') || await caches.match('/');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('<h1>Ortografía Lab está listo en modo offline.</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 3. Static Assets (Scripts, CSS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
