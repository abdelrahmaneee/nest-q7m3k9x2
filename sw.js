/* عُقاب — service worker: works offline; app updates arrive when online */
const V = 'oqab-202611152151';
const SHELL = ['./', './index.html', './style.css?v=202611152151', './firebase-config.js?v=202611152151', './core.js?v=202611152151', './art.js?v=202611152151', './widgets.js?v=202611152151', './term.js?v=202611152151', './py.js?v=202611152151', './content/terms.js?v=202611152151', './content/u1.js?v=202611152151', './content/u2.js?v=202611152151', './content/u3.js?v=202611152151', './content/u4.js?v=202611152151', './content/u5.js?v=202611152151', './content/u6.js?v=202611152151', './content/u7.js?v=202611152151', './content/u8.js?v=202611152151', './content/u9.js?v=202611152151', './content/u10.js?v=202611152151', './content/final.js?v=202611152151', './content/ctf.js?v=202611152151', './ctfui.js?v=202611152151', './app.js?v=202611152151', './coach.js?v=202611152151', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'oqab-py' && k !== 'oqab-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) { e.respondWith(caches.open('oqab-fonts').then(c => c.match(r).then(m => { const f = fetch(r).then(x => { if (x.ok || x.type === 'opaque') c.put(r, x.clone()); return x; }).catch(() => m); return m || f; }))); return; }
  if (u.origin !== location.origin) return;
  if (u.pathname.includes('/py/')) { e.respondWith(caches.open('oqab-py').then(c => c.match(r).then(m => m || fetch(r).then(x => { if (x.ok) c.put(r, x.clone()); return x; })))); return; }
  e.respondWith(fetch(r).then(x => { if (x.ok) { const cp = x.clone(); caches.open(V).then(c => c.put(r, cp)); } return x; }).catch(() => caches.match(r, { ignoreSearch: false }).then(m => m || caches.match('./index.html'))));
});
