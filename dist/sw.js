const CACHE='word-quest-v13';
const ASSETS=['./','./index.html','./styles.css','./app.js','./pets.js','./primary-vocab.js','./question-bank.js','./progression.js','./firebase-config.js','./manifest.webmanifest','./favicon.svg','./assets/forest-rescue.png','./assets/maple-mascot.png','./assets/river-world.png','./assets/pet-collection.png','./assets/pets-woodland-25.png','./assets/pets-water-25.png','./assets/pets-sky-25.png','./assets/pets-magic-25.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}
    return response;
  }).catch(()=>caches.match(event.request)));
});
