importScripts('https://unpkg.com/idb@7.0.1/build/umd.js'); // Enklaste idb

// Cache strategy for offline support
const CACHE_NAME = 'frost-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/projects',
  '/reports',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Network first, fallback to cache
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('sync', async event => {
  if (event.tag === 'syncTimeReports') {
    event.waitUntil((async () => {
      try {
        const db = await idb.openDB('frost-db', 1, {
          upgrade(db) { 
            if (!db.objectStoreNames.contains('offline_reports')) {
              db.createObjectStore('offline_reports', { keyPath: 'id', autoIncrement: true });
            }
          }
        });
        const reports = await db.getAll('offline_reports');
        for (const report of reports) {
          try {
            const response = await fetch('/api/time-report/offline', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(report)
            });
            if (response.ok) {
              await db.delete('offline_reports', report.id);
            }
          } catch (err) {
            console.error('Failed to sync report:', err);
          }
        }
      } catch (err) {
        console.error('Sync error:', err);
      }
    })());
  }
});
