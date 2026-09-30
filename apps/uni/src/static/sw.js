const CACHE_NAME = 'moyun-v1'
const PRECACHE = ['/', '/index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // API 请求不缓存
  if (url.pathname.startsWith('/api')) return

  // 静态资源：缓存优先
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((resp) => {
        const clone = resp.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
        return resp
      }))
    )
    return
  }

  // 页面：网络优先，离线回退缓存
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then((cached) => cached || caches.match('/')))
  )
})
