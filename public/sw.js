const CACHE_NAME = 'realtor-ai-v1';
const STATIC_CACHE_NAME = 'realtor-ai-static-v1';
const DYNAMIC_CACHE_NAME = 'realtor-ai-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('realtor-ai-') &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  // API calls - network only with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // HTML pages - network first, cache fallback
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Background sync for offline feedback submissions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

async function syncFeedback() {
  try {
    const cache = await caches.open('feedback-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync feedback:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from RealtorAI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RealtorAI', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});