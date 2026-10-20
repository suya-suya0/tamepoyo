// tamepoyo PWA updater (one-time migration to the stable launcher).
// Versioned pages remain separately accessible with ?launcher=1.
const CACHE_NAME='tamepoyo-v65-safe';
const SHELL=['./index.html','./manifest.json'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(async cache=>{
    for(const file of SHELL){try{const response=await fetch(file,{cache:'no-store'});if(response.ok)await cache.put(file,response)}catch(e){}}
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('tamepoyo-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    const isLegacy=/^\/tamepoyo\/index_v\d+\.html$/.test(url.pathname);
    if(isLegacy&&!url.searchParams.has('launcher')){
      event.respondWith(Response.redirect(new URL('./index.html',self.registration.scope).href,302));
      return;
    }
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response.ok)return response;
        throw new Error('navigation failed');
      }catch(e){
        const cache=await caches.open(CACHE_NAME);
        return (await cache.match('./index.html'))||Response.error();
      }
    })());
    return;
  }
  // Leave Supabase, external CDN requests, and other assets to their normal fetch handling.
});
