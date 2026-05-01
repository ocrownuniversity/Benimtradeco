const CACHE_NAME = 'benimtradeco-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install - cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip Firebase and external requests - always go network for those
  if (
    e.request.url.includes('firebaseio.com') ||
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('identitytoolkit') ||
    e.request.url.includes('paystack') ||
    e.request.url.includes('emailjs')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a copy of successful responses for local assets
        if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
