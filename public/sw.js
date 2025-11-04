// public/sw.js
// Service Worker för offline-stöd och cache-strategier

const STATIC_CACHE_NAME = 'frost-static-cache-v1';
const DYNAMIC_CACHE_NAME = 'frost-dynamic-cache-v1';
const IMAGE_CACHE_NAME = 'frost-image-cache-v1';

// Kritiska assets att pre-cachea
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
];

// 1. Install Event: Pre-cache kritiska assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching kritiska assets');
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
  
  self.skipWaiting(); // Aktivera direkt
});

// 2. Activate Event: Städa upp gamla cache-versioner
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  const cacheAllowlist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowlist.includes(cacheName)) {
            console.log('[SW] Tar bort gammal cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim(); // Ta kontroll direkt
});

// 3. Fetch Event: Cache-strategier
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // A. API-anrop (/api/*) -> Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirst(event.request, DYNAMIC_CACHE_NAME)
    );
    return;
  }

  // B. Next.js statiska assets -> Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      cacheFirst(event.request, STATIC_CACHE_NAME)
    );
    return;
  }

  // C. Bilder -> Stale-While-Revalidate
  if (/\.(png|jpe?g|webp|svg|gif)$/i.test(url.pathname)) {
    event.respondWith(
      staleWhileRevalidate(event.request, IMAGE_CACHE_NAME)
    );
    return;
  }

  // D. Sidor (Navigation) -> Network First med fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirst(event.request, DYNAMIC_CACHE_NAME).catch(() => {
        return caches.match('/') || new Response('Offline', { status: 503 });
      })
    );
    return;
  }
  
  // Annat: Network First
  event.respondWith(networkFirst(event.request, DYNAMIC_CACHE_NAME));
});

// Cache First: Check cache, fall back to network
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline - resource not cached', { status: 503 });
  }
}

// Network First: Try network, fall back to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )
    ]);

    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline och ingen cache' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale While Revalidate: Return cached, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// 4. Background Sync Event (för offline-ändringar)
self.addEventListener('sync', (event) => {
  if (event.tag === 'frost-background-sync') {
    console.log('[SW] Bakgrundssynkronisering triggad');
    
    // Post message till client för att trigga sync
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_REQUEST',
            source: 'service-worker'
          });
        });
      })
    );
  }
});

// 5. Message handler (för kommunikation med client)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

