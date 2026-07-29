// FitX AI Enterprise Service Worker (Task 2.1 Refined)
// Versioned Cache Key to prevent stale asset locks across deployments
const CACHE_VERSION = "fitx-v1.1.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets pre-cached during installation (App Shell)
const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/workout",
  "/calendar",
  "/recovery",
  "/profile",
  "/analytics",
  "/coach",
  "/offline"
];

// 1. INSTALL LIFECYCLE EVENT
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Force immediate activation without waiting for existing clients to close
  self.skipWaiting();
});

// 2. ACTIVATE LIFECYCLE EVENT
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            console.log("[FitX SW] Deleting obsolete cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Claim all active windows/tabs immediately
  self.clients.claim();
});

// 3. FETCH INTERCEPTION & MULTI-TIER CACHING STRATEGY
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // SECURITY RULE: Never cache Auth endpoints, JWT tokens, or sensitive API mutations
  if (url.pathname.startsWith("/api/v1/auth") || request.method !== "GET") {
    return;
  }

  // STRATEGY A: Static Navigation & App Shell -> Network First, Fallback to Cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/");
          });
        })
    );
    return;
  }

  // STRATEGY B: Static Assets & Fonts -> Cache First, Network Fallback
  if (url.pathname.startsWith("/_next/static") || url.hostname.includes("fonts.gstatic")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // STRATEGY C: Read-Only Telemetry APIs -> Stale-While-Revalidate
  if (url.pathname.startsWith("/api/v1/hpe") || url.pathname.startsWith("/api/v1/digital-twin")) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
});

// 4. MESSAGE EVENT & CLIENT COMMUNICATION
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 5. BACKGROUND SYNC EVENT HOOK (Future Task 2.3 Integration)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-workout-queue") {
    console.log("[FitX SW] Background sync event triggered for offline workouts");
  }
});

// 6. PUSH NOTIFICATION EVENT HOOK
self.addEventListener("push", (event) => {
  if (event.data) {
    const payload = event.data.json();
    self.registration.showNotification(payload.title || "FitX AI Alert", {
      body: payload.body || "Your daily recovery score is ready.",
      icon: "/favicon.ico"
    });
  }
});
