/* Caches this page's own shell so it opens instantly and survives a dead
   network. Nothing else is touched: the player lives on another origin, and so
   do the lyrics services, and a stale answer from either would be worse than no
   answer at all. Bump CACHE to retire an old shell. */
'use strict';

const CACHE = 'ytm-remote-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest',
               './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  /* one missing entry must not fail the whole install, so they are fetched
     individually rather than through addAll */
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map((u) => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;              // player and lyrics APIs
  if (!url.pathname.startsWith(new URL('./', self.location).pathname)) return;

  /* Network first, so a deploy is picked up as soon as there is a connection,
     falling back to the cached shell when there is not. A navigation that finds
     neither still has to resolve to something, hence the cached index. */
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone());
      return fresh;
    } catch {
      const hit = await caches.match(req);
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html') || await caches.match('./');
        if (shell) return shell;
      }
      throw new Error('offline and not cached');
    }
  })());
});
