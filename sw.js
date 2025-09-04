self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('alagabi-v1').then(c=>c.addAll([
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js','/js/forms.js','/js/bot.js','/js/store.js','/js/tests.js','/js/auth.js','/js/admin.js',
    '/data/seed.js'
  ])));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});