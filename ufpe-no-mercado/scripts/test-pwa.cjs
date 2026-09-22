const assert = require("node:assert/strict");
const { test } = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const workerTemplate = fs.readFileSync(path.join(__dirname, "service-worker.js"), "utf8");
const DEFAULT_FILES = ["index.html", "Novo_video.mp4", "assets/app.js", "fonts/body.woff2"];
const VIDEO = "0123456789";

function fakeCacheStorage() {
  const stores = new Map();
  const keyOf = (request) => typeof request === "string" ? request : request.url;
  return {
    stores,
    async open(name) {
      if (!stores.has(name)) {
        const entries = new Map();
        stores.set(name, {
          async addAll(requests) {
            // Cache.addAll é atômico: nenhuma entrada é publicada antes de baixar todas.
            const downloaded = await Promise.all(requests.map(async (request) => {
              const response = await this.download(request);
              if (!response.ok || response.status === 206) throw new TypeError("Download incompleto");
              return [keyOf(request), response];
            }));
            for (const [key, response] of downloaded) entries.set(key, response.clone());
          },
          async match(request) { return entries.get(keyOf(request))?.clone(); },
          async put(request, response) { entries.set(keyOf(request), response.clone()); },
          async keys() { return [...entries.keys()].map((url) => new Request(url)); },
        });
      }
      return stores.get(name);
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
}

function createWorker({
  scope = "https://totem.example/evento/",
  version = "v1",
  files = DEFAULT_FILES,
  storage = fakeCacheStorage(),
  download,
  source,
} = {}) {
  const listeners = new Map();
  const actions = { skipWaiting: 0, claim: 0, network: [] };
  const network = async (request) => {
    actions.network.push(request.url);
    if (download) return download(request);
    return request.url.endsWith("Novo_video.mp4")
      ? new Response(VIDEO, { headers: { "Content-Type": "video/mp4", "Content-Length": "10" } })
      : new Response(`arquivo:${new URL(request.url).pathname}`, { headers: { "Content-Type": "text/html" } });
  };
  const caches = {
    ...storage,
    async open(name) {
      const cache = await storage.open(name);
      cache.download = network;
      return cache;
    },
  };
  const self = {
    registration: { scope },
    addEventListener(type, callback) { listeners.set(type, callback); },
    async skipWaiting() { actions.skipWaiting++; },
    clients: { async claim() { actions.claim++; } },
  };
  const script = source ?? workerTemplate
    .replace("__VERSION__", JSON.stringify(version))
    .replace("__ASSETS__", JSON.stringify(files));
  vm.runInNewContext(script, { self, caches, fetch: network, URL, Request, Response, Headers }, {
    filename: "service-worker.js",
  });

  async function dispatch(type, fields = {}) {
    const pending = [];
    let response;
    listeners.get(type)?.({
      ...fields,
      waitUntil(promise) { pending.push(promise); },
      respondWith(promise) { response = Promise.resolve(promise); },
    });
    await Promise.all(pending);
    return response;
  }
  return {
    scope, storage, actions,
    install: () => dispatch("install"),
    activate: () => dispatch("activate"),
    async ready() {
      let message;
      await dispatch("message", {
        data: { type: "CHECK_OFFLINE" },
        ports: [{ postMessage(value) { message = value; } }],
      });
      return message;
    },
    request(url, { mode = "navigate", method = "GET", range } = {}) {
      return dispatch("fetch", {
        request: { url: new URL(url, scope).href, mode, method, headers: new Headers(range ? { range } : {}) },
      });
    },
  };
}

test("falha no download do vídeo não declara pronto nem apaga a versão ativa", async () => {
  const storage = fakeCacheStorage();
  const previous = createWorker({ storage, version: "anterior" });
  await previous.install();
  await previous.activate();
  const activeCaches = await storage.keys();
  const updating = createWorker({
    storage,
    version: "atualizacao",
    download: async (request) => {
      if (request.url.endsWith("Novo_video.mp4")) throw new TypeError("Sem conexão");
      return new Response("download parcial dos demais arquivos");
    },
  });
  await assert.rejects(updating.install(), /Sem conexão/);
  assert.deepEqual(await storage.keys(), activeCaches, "a instalação falha remove somente seu cache novo");
  assert.equal((await updating.ready()).ready, false);
  assert.equal((await previous.ready()).ready, true);
  assert.equal(await (await previous.request("index.html")).text(), "arquivo:/evento/index.html");
  assert.equal(await (await previous.request("Novo_video.mp4", { mode: "no-cors" })).text(), VIDEO);
});

test("a confirmação offline aguarda o vídeo inteiro e também exige as fontes", async () => {
  let finishVideo;
  const video = new Promise((resolve) => { finishVideo = resolve; });
  const worker = createWorker({
    download: (request) => request.url.endsWith("Novo_video.mp4") ? video : Promise.resolve(new Response("arquivo")),
  });
  const installing = worker.install();
  assert.equal((await worker.ready()).ready, false, "download pendente não é preparo completo");
  finishVideo(new Response(VIDEO));
  await installing;
  assert.equal((await worker.ready()).ready, true);

  const withoutFont = createWorker({
    download: async (request) => new Response("arquivo", { status: request.url.endsWith(".woff2") ? 404 : 200 }),
  });
  await assert.rejects(withoutFont.install(), /Download incompleto/);
  assert.equal((await withoutFont.ready()).ready, false);
});

test("navegação offline funciona na raiz e no subdiretório, com query e index.html", async () => {
  for (const scope of ["https://totem.example/", "https://totem.example/feiras/ufpe/"]) {
    let online = true;
    const worker = createWorker({ scope, download: async () => {
      if (!online) throw new TypeError("Sem conexão");
      return new Response("<h1>Totem disponível</h1>");
    } });
    await worker.install();
    online = false;
    const downloads = worker.actions.network.length;
    for (const url of [scope, `${scope}?origem=icone`, `${scope}index.html`, `${scope}index.html?v=2`]) {
      const response = await worker.request(url);
      assert.equal(response.status, 200, url);
      assert.equal(await response.text(), "<h1>Totem disponível</h1>");
    }
    assert.equal(worker.actions.network.length, downloads, "reabertura offline não depende de fetch");
    assert.equal((await worker.ready()).ready, true);
  }
});

test("vídeo offline aceita intervalo, sufixo e faixa aberta e rejeita intervalo impossível", async () => {
  const worker = createWorker();
  await worker.install();
  const downloads = worker.actions.network.length;
  for (const [range, expected, contentRange] of [
    ["bytes=2-5", "2345", "bytes 2-5/10"],
    ["bytes=-3", "789", "bytes 7-9/10"],
    ["bytes=7-", "789", "bytes 7-9/10"],
    ["bytes=8-99", "89", "bytes 8-9/10"],
    ["bytes=-99", VIDEO, "bytes 0-9/10"],
  ]) {
    const response = await worker.request("Novo_video.mp4", { mode: "no-cors", range });
    assert.equal(response.status, 206, range);
    assert.equal(response.headers.get("Content-Type"), "video/mp4");
    assert.equal(response.headers.get("Content-Range"), contentRange);
    assert.equal(response.headers.get("Content-Length"), String(expected.length));
    assert.equal(response.headers.get("Accept-Ranges"), "bytes");
    assert.equal(await response.text(), expected);
  }
  for (const range of ["bytes=10-", "bytes=7-2", "bytes=-0"]) {
    const response = await worker.request("Novo_video.mp4", { mode: "no-cors", range });
    assert.equal(response.status, 416, range);
    assert.equal(response.headers.get("Content-Range"), "bytes */10");
    assert.equal(await response.text(), "");
  }
  const malformed = await worker.request("Novo_video.mp4", { mode: "no-cors", range: "bytes=0-1,4-5" });
  assert.equal(malformed.status, 200, "uma faixa múltipla pode ser ignorada, devolvendo o arquivo completo");
  assert.equal(await malformed.text(), VIDEO);
  assert.equal(worker.actions.network.length, downloads, "todas as faixas usam o vídeo salvo");
});

test("a ativação limpa versões antigas somente no seu escopo", async () => {
  const storage = fakeCacheStorage();
  const old = createWorker({ storage, scope: "https://totem.example/ufpe/", version: "antiga" });
  const sibling = createWorker({ storage, scope: "https://totem.example/ufpe-outro/" });
  const nested = createWorker({ storage, scope: "https://totem.example/ufpe/outro/" });
  await old.install();
  await sibling.install();
  await nested.install();
  await storage.open("outro-aplicativo");
  const before = await storage.keys();
  const current = createWorker({ storage, scope: old.scope, version: "nova" });
  await current.install();
  await current.activate();
  const after = await storage.keys();
  assert.equal(after.length, before.length);
  assert.ok(after.includes("outro-aplicativo"));
  assert.equal((await sibling.ready()).ready, true);
  assert.equal((await nested.ready()).ready, true);
  assert.equal((await current.ready()).ready, true);
  assert.equal((await old.ready()).ready, false, "a versão antiga do mesmo escopo foi removida");
});

test("instalação não força troca da versão nem assume clientes antes da ativação", async () => {
  const worker = createWorker();
  await worker.install();
  assert.equal(worker.actions.skipWaiting, 0, "o navegador deve aguardar o fechamento dos clientes antigos");
  assert.equal(worker.actions.claim, 0, "a instalação não deve interromper o quiz");
  await worker.activate();
  assert.equal(worker.actions.skipWaiting, 0);
  assert.equal(worker.actions.claim, 1);
});

test("Gupy, outros projetos, arquivos ausentes e escritas não são interceptados", async () => {
  const worker = createWorker();
  await worker.install();
  for (const url of ["https://grupomoura.gupy.io/jobs/123", "https://totem.example/outro/index.html", "image_1657a3.jpg"]) {
    assert.equal(await worker.request(url), undefined);
  }
  assert.equal(await worker.request("index.html", { method: "POST" }), undefined);
});

function buildFixture(t) {
  const temporaryRoot = path.resolve(os.tmpdir());
  const fixture = fs.mkdtempSync(path.join(temporaryRoot, "ufpe-pwa-test-"));
  t.after(() => {
    const relative = path.relative(temporaryRoot, path.resolve(fixture));
    assert.ok(relative.startsWith("ufpe-pwa-test-") && !relative.includes(path.sep), "limpeza restrita à pasta temporária criada pelo teste");
    fs.rmSync(fixture, { recursive: true, force: true });
  });
  const put = (relative, content) => {
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  put("scripts/build-pwa.mjs", fs.readFileSync(path.join(__dirname, "build-pwa.mjs")));
  put("scripts/service-worker.js", workerTemplate);
  for (const file of ["index.html", "Novo_video.mp4", "Imagem2.png", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "assets/app.js", "fonts/body.woff2"]) {
    put(`dist/${file}`, file === "Novo_video.mp4" ? VIDEO : `conteudo:${file}`);
  }
  const run = () => spawnSync(process.execPath, [path.join(fixture, "scripts/build-pwa.mjs")], { encoding: "utf8" });
  const readWorker = () => fs.readFileSync(path.join(fixture, "dist/sw.js"), "utf8");
  return { fixture, put, run, readWorker };
}

test("build inclui ativos reais, exclui mapas e worker antigo e muda versão quando o conteúdo muda", async (t) => {
  const fixture = buildFixture(t);
  fixture.put("dist/assets/app.js.map", "source map de desenvolvimento");
  fixture.put("dist/sw.js", "worker anterior");
  let result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  const first = fixture.readWorker();
  const downloaded = [];
  const worker = createWorker({ source: first, download: async (request) => {
    downloaded.push(new URL(request.url).pathname);
    return new Response("arquivo completo");
  } });
  await worker.install();
  assert.equal((await worker.ready()).ready, true);
  assert.ok(downloaded.includes("/evento/Novo_video.mp4"));
  assert.ok(downloaded.includes("/evento/fonts/body.woff2"));
  assert.ok(downloaded.includes("/evento/icons/icon-512.png"));
  assert.ok(!downloaded.some((file) => file.endsWith(".map") || file.endsWith("sw.js") || file.endsWith("image_1657a3.jpg")));

  result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fixture.readWorker(), first, "build idêntico mantém a versão");
  fixture.put("dist/Novo_video.mp4", "vídeo novo com o mesmo nome");
  result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  const changedVideo = fixture.readWorker();
  assert.notEqual((await createWorker({ source: changedVideo }).ready()).version, (await createWorker({ source: first }).ready()).version);

  fixture.put("scripts/service-worker.js", `${workerTemplate}\n// alteração do worker\n`);
  result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual((await createWorker({ source: fixture.readWorker() }).ready()).version, (await createWorker({ source: changedVideo }).ready()).version);
});

test("build incompleto sem vídeo falha antes de publicar um worker novo", (t) => {
  const fixture = buildFixture(t);
  fixture.put("dist/sw.js", "worker anterior preservado");
  fs.unlinkSync(path.join(fixture.fixture, "dist/Novo_video.mp4"));
  const result = fixture.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Novo_video\.mp4/);
  assert.equal(fixture.readWorker(), "worker anterior preservado");
});
