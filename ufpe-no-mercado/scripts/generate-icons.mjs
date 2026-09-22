// Ícone geométrico da bateria do quiz. Gera PNGs sem dependências extras.
import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, body, checksum]);
}

const directory = new URL("../public/icons/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const size of [192, 512]) {
  const pixels = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const shell = u >= .22 && u < .74 && v >= .32 && v < .68;
      const inside = u >= .245 && u < .715 && v >= .35 && v < .65;
      const tip = u >= .75 && u < .79 && v >= .43 && v < .57;
      const cell = v >= .38 && v < .62 && [.28, .42, .56].some((left) => u >= left && u < left + .11);
      const color = cell ? [250, 185, 0] : ((shell && !inside) || tip) ? [255, 255, 255] : [20, 33, 63];
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      pixels.set(color, offset);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  await writeFile(new URL(`icon-${size}.png`, directory), Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0)),
  ]));
}
