const CACHE_NAME = 'bnguqua-v1';
const ASSETS = [
    './',
    './index.html',
    './timeline.html',
    './resource/images/mizzubibi.jpg',
    './resource/images/mi here.jpg',
    // ... possibly more assets could be added manually or dynamically
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // HTML files: Stale-While-Revalidate
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                return response;
            }).catch(() => caches.match(request))
        );
        return;
    }

    // Static assets: Cache First
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request).then((fetchRes) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, fetchRes.clone());
                    return fetchRes;
                });
            });
        })
    );
});
