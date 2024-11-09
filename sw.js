// Nome do cache
const CACHE_NAME = "pwa-fechadura-cache-v1";

// Arquivos que serão armazenados em cache
const FILES_TO_CACHE = [
    "/",
    "/login",
    "/commandos",
    "/style.css",
    "/manifest.json",
	"/JavaScript.js",
    "/sw.js",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-48x48.png?raw=true",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-72x72.png?raw=true",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-96x96.png?raw=true",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-144x144.png?raw=true",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-192x192.png?raw=true",
    "https://github.com/BFKAutomacao/pwa-fechadura/blob/main/icone-512x512.png?raw=true",
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache aberto, adicionando arquivos');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Removendo cache antigo: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação das requisições para usar o cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log(`Retornando do cache: ${event.request.url}`);
                return response;
            }

            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                    console.log(`Arquivo adicionado ao cache: ${event.request.url}`);
                });

                return networkResponse;
            }).catch(() => {
                console.log('Falha ao buscar da rede. Retornando fallback.');
            });
        })
    );
});
