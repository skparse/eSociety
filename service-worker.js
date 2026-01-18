/**
 * Service Worker for Society Maintenance Billing PWA
 * Provides offline support and caching
 */

const CACHE_NAME = 'society-billing-v2';

// Get the base path dynamically (works with subdirectories like GitHub Pages)
const getBasePath = () => {
    const swPath = self.location.pathname;
    return swPath.substring(0, swPath.lastIndexOf('/') + 1);
};

// Static assets to cache (relative paths)
const STATIC_ASSET_NAMES = [
    'index.html',
    'login.html',
    'css/style.css',
    'css/admin.css',
    'css/member.css',
    'js/config.js',
    'js/utils.js',
    'js/storage.js',
    'js/auth.js',
    'manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                const basePath = getBasePath();
                const urlsToCache = STATIC_ASSET_NAMES.map(name => basePath + name);
                // Also cache the base path itself
                urlsToCache.unshift(basePath);
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Google Apps Script API calls (always fetch from network)
    if (url.hostname === 'script.google.com') {
        return;
    }

    // For HTML pages - network first, fallback to cache
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clone);
                    });
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // For other assets - cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((response) => {
                    // Cache the new resource
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                });
            })
    );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('Background sync triggered');
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const basePath = getBasePath();
        const options = {
            body: data.body,
            icon: basePath + 'icons/icon-192.png',
            badge: basePath + 'icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || basePath
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
