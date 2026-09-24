const CACHE='github-protect-v46';
const CORE=['./','./index.html','./manifest.json','./icon.svg','./latest-version.json','./landing.css','./landing.js','./translator.js','./pro-upgrade.js','./traffic-engine.js','./security-suite.js','./security-assistant.js','./feedback.js','./security-page.css','./analytics-consent.js','./privacy/','./security-guides/','./share/','./what-is-github-protector/','./pro/','./teams/'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const request=event.request,url=new URL(request.url);
 if(url.origin!==location.origin)return;
 event.respondWith(fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response}).catch(async()=>await caches.match(request)||await caches.match('./index.html')));
});