const scope = self.registration.scope;
const cachePrefix = `bathroom-finder-shell:${scope}:`;
const cacheName = cachePrefix + "f55193d9bbc154967939";
const shell = new Set(["assets/MapView-CIGW-MKW.css","assets/MapView-DYCaqkg3.js","assets/index-CIktWKqL.css","assets/index-CU4ybZpV.js","bryant-park-restroom.jpg","favicon.png","index.html","nyc-restrooms.json"].map((path) => new URL(path, scope).href));
const index = new URL("index.html", scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) =>
    cache.addAll([...shell].map((url) => new Request(url, { cache: "reload" })))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(async (keys) => {
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  }));
});

async function fromShell(url) {
  return (await caches.open(cacheName)).match(url);
}

async function navigate(request) {
  try {
    const response = await fetch(request);
    if (response.ok) return response;
  } catch {
    // The installed shell can open when the network is unreachable.
  }
  return (await fromShell(index)) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const canonical = url.origin + url.pathname;

  if (request.mode === "navigate" && (canonical === scope || canonical === index)) {
    event.respondWith(navigate(request));
  } else if (shell.has(canonical)) {
    event.respondWith(fromShell(canonical).then((cached) => cached ?? fetch(request)));
  }
});
