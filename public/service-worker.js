const CACHE_NAME = 'agrocontador-v1.0.0';
const STATIC_CACHE_NAME = 'agrocontador-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'agrocontador-dynamic-v1.0.0';

// Recursos essenciais para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos que devem ser sempre buscados da rede
const NETWORK_FIRST_ROUTES = [
  '/api/',
  'https://api.supabase.co/',
  'https://supabase.co/'
];

// Recursos que podem ser servidos do cache primeiro
const CACHE_FIRST_ROUTES = [
  '/static/',
  '/assets/',
  '/icons/',
  '.js',
  '.css',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache estático criado');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Recursos estáticos em cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('agrocontador-')) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativado e assumindo controle');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na ativação:', error);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorar requisições de extensões do navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Estratégia Network First para APIs e dados dinâmicos
  if (isNetworkFirstRoute(request.url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estratégia Cache First para recursos estáticos
  if (isCacheFirstRoute(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Estratégia Stale While Revalidate para navegação
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Estratégia padrão: Cache First com fallback para rede
  event.respondWith(cacheFirstStrategy(request));
});

// Verificar se a URL deve usar Network First
function isNetworkFirstRoute(url) {
  return NETWORK_FIRST_ROUTES.some(route => url.includes(route));
}

// Verificar se a URL deve usar Cache First
function isCacheFirstRoute(url) {
  return CACHE_FIRST_ROUTES.some(route => url.includes(route));
}

// Estratégia Network First
async function networkFirstStrategy(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    // Se a resposta for bem-sucedida, armazenar no cache dinâmico
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Rede indisponível, tentando cache para:', request.url);
    
    // Se a rede falhar, tentar buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não houver cache, retornar página offline para navegação
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Estratégia Cache First
async function cacheFirstStrategy(request) {
  // Tentar buscar do cache primeiro
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Se não estiver em cache, buscar da rede
    const networkResponse = await fetch(request);
    
    // Armazenar no cache dinâmico se a resposta for bem-sucedida
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Erro ao buscar recurso:', request.url, error);
    
    // Para navegação, retornar página principal como fallback
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar da rede em paralelo
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('🌐 Service Worker: Erro de rede em stale-while-revalidate:', error);
      return null;
    });
  
  // Retornar cache imediatamente se disponível, senão aguardar rede
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await networkResponsePromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Fallback para página principal
  return caches.match('/');
}

// Limpar caches antigos periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('agrocontador-dynamic-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// Notificar sobre atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎯 Service Worker: AgroContador PWA carregado');