const CACHE_NAME = "kneecare-cache-v4";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("LOG: [ServiceWorker] Clean installation.");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

// Fetch interceptor with Cross-Origin Protection for AI Studio
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // CRITICAL FIX: If the request is for Google AI Studio auth-bridge, completely ignore it
  if (url.hostname.includes("google.com") || url.pathname.includes("applet-auth-bridge")) {
    return; // Let the browser handle it naturally without service worker interference
  }

  // Bypass everything else directly to the network for dev stability
  event.respondWith(
    fetch(event.request).catch((err) => {
      console.log("LOG: [ServiceWorker] Network pass-through failed safely:", err.message);
    })
  );
});
