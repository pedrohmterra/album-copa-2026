// Service Worker - Álbum Copa 2026
// Versão simples: cache offline básico
const CACHE_NAME = 'album-copa-2026-v1';

self.addEventListener('install', (event) => {
  // Ativa imediatamente sem esperar abas antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Toma controle de todas as abas imediatamente
  event.waitUntil(self.clients.claim());

  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  // Apenas para navegação GET
  if (event.request.method !== 'GET') return;

  // Estratégia: rede primeiro, cache como fallback (para sempre ter versão atual)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Sucesso: salva no cache para uso offline futuro
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Sem rede: tenta o cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Sem cache também: retorna a página principal (para SPA)
          return caches.match('./');
        });
      })
  );
});
