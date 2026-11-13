// SeumArena service worker: the game page is fetched fresh when online (so updates show up on the next launch)
// and served from the cache when offline; icons, the PeerJS library and fonts are cached as they are used.
const CACHE = 'seumarena-v1';
const PAGE = new URL('./', self.location).href;
const CORE = [PAGE, 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
const SCOPE_PATH = new URL('./', self.location).pathname;
const GAME_PATHS = [SCOPE_PATH, SCOPE_PATH + 'index.html'];   // only the game page is the app page; other pages are not stored as it
const SITE_PATH = SCOPE_PATH + 'site/';
const RUNTIME_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('seumarena-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function page(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(PAGE);
  try {
    const net = fetch(req);
    const res = cached ? await Promise.race([net, new Promise((_, no) => setTimeout(no, 6000))]) : await net;
    if (res.ok && res.type === 'basic') {
      const tag = res.headers.get('etag'), old = cached && cached.headers.get('etag');
      if (!tag || tag !== old) cache.put(PAGE, res.clone());
    }
    return res;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname.startsWith(SITE_PATH)) return;   // the site (intro/tips/community) always comes from the network
  if (req.mode === 'navigate' && url.origin === self.location.origin) { if (GAME_PATHS.includes(url.pathname)) e.respondWith(page(req)); return; }
  if (url.origin === self.location.origin && url.pathname.includes('/news/')) return;   // the news list and its pictures always come from the network
  if (url.origin === self.location.origin || RUNTIME_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(req));
});
