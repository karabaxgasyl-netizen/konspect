const C='konspekt-v11-chem-formulas';
const CORE=['./','index.html','css/style.css','js/app.js','data/subjects.json','data/geography-9.json','data/history-9-medinsky.json','data/physics-9-peryshkin.json','data/social-9-medvedev.json','data/biology-9-pasechnik.json','data/chemistry-9-gabrielyan.json','manifest.webmanifest','icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));}return res;}).catch(()=>r);return r||f;}));});
