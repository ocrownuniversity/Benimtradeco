const CACHE_NAME = 'benimtradeco-v2';
const ASSETS = [
  '/Benimtradeco/',
  '/Benimtradeco/index.html',
  '/Benimtradeco/manifest.json',
  '/Benimtradeco/icon-192.png',
  '/Benimtradeco/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (
    e.request.url.includes('firebaseio.com') ||
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('identitytoolkit') ||
    e.request.url.includes('paystack') ||
    e.request.url.includes('emailjs') ||
    e.request.url.includes('gstatic.com')
  ) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
