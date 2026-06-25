// Minimal service worker — enables installability + light offline caching.
const CACHE = "dietlife-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Network-first; fall back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches
          .open(CACHE)
          .then((c) => c.put(req, copy))
          .catch(() => {});
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
