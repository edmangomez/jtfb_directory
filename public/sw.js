const CACHE_NAME = 'jtfb-phone-cache-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

// Network-First for HTML, Cache-First ONLY for static /assets/
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // NEVER intercept backend API requests or Service Worker scripts
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('sw.js') ||
    url.pathname.endsWith('sw-v5.js')
  ) {
    return;
  }

  // For HTML pages / root, ALWAYS try Network first so user gets latest version immediately
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('/'))
    );
    return;
  }

  // Only cache static assets (/assets/, images, icons)
  if (url.pathname.startsWith('/assets/') || /\.(png|jpg|jpeg|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});
