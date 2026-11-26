// Shell only: never cache uploaded videos, API responses or private user content.
const CACHE='wise2-shell-v09';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/web/manifest.webmanifest']))));
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).pathname==='/')e.respondWith(fetch(e.request).catch(()=>caches.match('/')))});
