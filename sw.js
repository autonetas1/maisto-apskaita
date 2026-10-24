// Leidžia programėlei veikti be interneto: failai įsimenami telefone.
// Atidarius su internetu, nauja versija parsiunčiama fone ir įsigalioja kitą kartą.
// Pardavimų duomenys čia nesaugomi — jie lieka naršyklės saugykloje (localStorage).
const CACHE = 'maisto-apskaita-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const fresh = caches.open(CACHE).then(c => fetch(req).then(res => {
    if (res.ok) c.put(req, res.clone());
    return res;
  })).catch(() => null);
  e.waitUntil(fresh);
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fresh.then(res =>
    res || caches.match('./index.html'))));
});
