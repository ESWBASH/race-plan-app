// ClaudeCoach Service Worker — offline-capable PWA
const CACHE = 'claudecoach-v1'

// App shell — these get pre-cached on install
const PRECACHE = [
  '/',
  '/index.html',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // API calls — network only, never cache
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Strava OAuth redirects — network only
  if (url.pathname.startsWith('/auth/')) {
    return
  }

  // Navigation requests — serve app shell (index.html) from cache, fall back to network
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then(r => r || fetch(e.request))
    )
    return
  }

  // Static assets — cache first, then network + update cache
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(response => {
        // Only cache successful same-origin responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE).then(cache => cache.put(e.request, clone))
        }
        return response
      }).catch(() => {
        // If we can't fetch, return a basic offline response for HTML requests
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html')
        }
      })
    })
  )
})
