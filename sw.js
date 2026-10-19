const NAME = 'tamepoyo-v4-20261019';
const ASSETS = ['./','./manifest.json','./index_v4.html','./tamepoyo_v4.js','./brand-main-v4.png','./pose-home.png','./pose-ledger.png','./pose-wishes.png','./pose-shared.png','./pose-settings.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(NAME).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 // Dynamic GitHub Pages router, HTML and JS must refresh whenever online.
 e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{if(res.ok){const copy=res.clone();caches.open(NAME).then(c=>c.put(e.request,copy)).catch(()=>{})}return res}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));
});
