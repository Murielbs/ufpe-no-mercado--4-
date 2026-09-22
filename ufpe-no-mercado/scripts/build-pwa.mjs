import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const name = `${prefix}${entry.name}`;
    return entry.isDirectory() ? listFiles(path.join(directory, entry.name), `${name}/`) : name;
  }));
  return files.flat();
}

const files = (await listFiles(dist)).filter((file) => file !== "sw.js" && !file.endsWith(".map")).sort();
for (const required of ["index.html", "Novo_video.mp4", "Imagem2.png", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"]) {
  if (!files.includes(required)) throw new Error(`Arquivo offline obrigatório ausente: ${required}`);
}
const template = await readFile(path.join(root, "scripts/service-worker.js"), "utf8");
const hash = createHash("sha256").update(template);
let bytes = 0;
for (const file of files) {
  const content = await readFile(path.join(dist, file));
  hash.update(file).update(content);
  bytes += content.length;
}
const version = hash.digest("hex").slice(0, 16);
const worker = template.replace("__VERSION__", JSON.stringify(version)).replace("__ASSETS__", JSON.stringify(files));
await writeFile(path.join(dist, "sw.js"), worker);
console.log(`PWA: ${files.length} arquivos (${(bytes / 1024 / 1024).toFixed(1)} MiB), incluindo o vídeo. Versão ${version}.`);
