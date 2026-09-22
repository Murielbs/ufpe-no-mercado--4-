/* Os marcadores são preenchidos pelo build; este arquivo não é servido diretamente. */
const VERSION = __VERSION__;
const FILES = __ASSETS__;
const BASE = self.registration.scope;
const PREFIX = `ufpe-offline:${new URL(BASE).pathname}:`;
const CACHE = `${PREFIX}${VERSION}`;
const URLS = FILES.map((file) => new URL(file, BASE).href);
const PRECACHED = new Set(URLS);
const INDEX = new URL("index.html", BASE).href;

self.addEventListener("install", (event) => {
  // addAll só conclui quando TODOS os arquivos foram salvos, inclusive o MP4 inteiro.
  // Sem skipWaiting: uma atualização não troca a versão durante o quiz.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll(URLS.map((url) => new Request(url, { cache: "reload" })));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(PREFIX) && name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function rangeResponse(response, range) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  // Uma faixa inválida/múltipla pode ser ignorada com resposta completa (HTTP 200).
  if (!match || (!match[1] && !match[2])) return response;
  const data = await response.arrayBuffer();
  const size = data.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const headers = new Headers(response.headers);
  headers.delete("Content-Encoding");
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  return new Response(data.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  const isHome = request.mode === "navigate" && (url.href === BASE || url.href === INDEX);
  const key = isHome ? INDEX : url.href;
  // Não intercepta Gupy, outros projetos no mesmo domínio ou arquivos inexistentes.
  if (!PRECACHED.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    if (!cached) return fetch(request);
    const range = request.headers.get("range");
    return range ? rangeResponse(cached, range) : cached;
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CHECK_OFFLINE" || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const saved = new Set((await cache.keys()).map((request) => request.url));
      event.ports[0].postMessage({ ready: URLS.every((url) => saved.has(url)), version: VERSION });
    } catch {
      event.ports[0].postMessage({ ready: false });
    }
  })());
});
