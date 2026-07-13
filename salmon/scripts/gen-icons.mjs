// PWA 아이콘 생성기 — 외부 이미지 도구 없이 zlib만으로 PNG 생성.
// 연어(코랄) 색 물고기 실루엣을 짙은 남색 배경 위에 픽셀로 그린다.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(outDir, { recursive: true });

const BG = [16, 24, 40];      // 짙은 남색
const FISH = [250, 128, 114]; // salmon
const BELLY = [255, 183, 170];

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x / size, y / size);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// 정규화 좌표(0..1)에서 물고기 모양 판정
function pixel(u, v) {
  const cx = 0.44, cy = 0.5;
  // 몸통: 타원
  const bx = (u - cx) / 0.30, by = (v - cy) / 0.185;
  const inBody = bx * bx + by * by <= 1;
  // 꼬리: 몸통 오른쪽의 삼각형
  const inTail = u > 0.68 && u < 0.86 && Math.abs(v - cy) < (u - 0.68) * 1.05;
  if (inBody) {
    // 배 쪽(아래 절반)은 밝은 색, 눈은 배경색 점
    const ex = (u - 0.27) / 0.028, ey = (v - 0.45) / 0.028;
    if (ex * ex + ey * ey <= 1) return BG;
    return v > cy + 0.04 ? BELLY : FISH;
  }
  if (inTail) return FISH;
  return BG;
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), png(size, pixel));
  console.log(`generated public/icon-${size}.png`);
}
