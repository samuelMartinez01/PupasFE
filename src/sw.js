const pupasvcache = "pupas-cache-v1";
const assets = [
  "/index.html",
  "/styles/main.css",
  "/styles/producto.css",
  "/styles/tipoproducto.css",
  "/styles/cajon.css",
  "/js/Control/Main.js",
  "/js/Control/Producto.js",
  "/js/Control/TipoProducto.js",
  "/js/Control/Orden.js",
  "/js/Control/Combo.js",
  "/js/Control/Pago.js",
  "/js/Boundary/OrdenElement.js",
  "/js/Boundary/instalador_pwa.js",
  "/icons/web-app-manifest-192x192.png",
  "/icons/web-app-manifest-512x512.png",
  "/icons/favicon-96x96.png"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(pupasvcache).then((cache) => 
      cache.addAll(assets))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Solo cachea si es respuesta válida
if (!networkResponse || networkResponse.status !== 200) {
  return networkResponse;
}


        const responseToCache = networkResponse.clone();
        caches.open("dynamic-api-cache").then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }

      return new Response("Sin conexión y sin caché disponible", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      });
    })
  );
});

