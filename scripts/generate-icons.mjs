/**
 * Generates the full app icon set for Boring Internet with no dependencies.
 *
 * Mark: an ink tile holding three stacked caps ("boring bars") — a minimal
 * list shape, with the middle bar in the brand orange.
 *
 *   bun scripts/generate-icons.mjs
 *
 * Writes: public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png,
 * public/icon-192.png, public/icon-512.png, public/og.png, public/manifest.webmanifest
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const INK = [0x1a, 0x12, 0x0b];
const CREAM = [0xf7, 0xe0, 0xc6];
const SURFACE = [0xff, 0xf7, 0xee];
const ACCENT = [0xd9, 0x60, 0x1f];

/* ---------------- canvas ---------------- */

class Canvas {
  constructor(size) {
    this.size = size;
    this.data = new Float64Array(size * size * 4); // straight alpha, 0..255
  }

  /** Fill a pixel rect with a flat colour. */
  rect(x0, y0, x1, y1, color) {
    const size = this.size;
    const ax = Math.max(0, Math.round(x0));
    const ay = Math.max(0, Math.round(y0));
    const bx = Math.min(size, Math.round(x1));
    const by = Math.min(size, Math.round(y1));
    for (let y = ay; y < by; y++) {
      for (let x = ax; x < bx; x++) {
        this.put(x, y, color);
      }
    }
  }

  put(x, y, color) {
    const i = (y * this.size + x) * 4;
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
    this.data[i + 3] = color[3] ?? 255;
  }

  /** Supersampled fill of overlapping rounded rects, in order (last on top). */
  shapes(shapes, { ss = 4 } = {}) {
    const size = this.size;
    const step = 1 / ss;
    const samples = ss * ss;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let sy = 0; sy < ss; sy++) {
          for (let sx = 0; sx < ss; sx++) {
            const px = x + (sx + 0.5) * step;
            const py = y + (sy + 0.5) * step;
            let hit = null;
            for (const shape of shapes) {
              if (insideRoundRect(px, py, shape)) hit = shape;
            }
            if (!hit) continue;
            const alpha = (hit.color[3] ?? 255) / 255;
            r += hit.color[0] * alpha;
            g += hit.color[1] * alpha;
            b += hit.color[2] * alpha;
            a += alpha;
          }
        }
        if (a === 0) continue;
        const i = (y * size + x) * 4;
        this.data[i] = r / a;
        this.data[i + 1] = g / a;
        this.data[i + 2] = b / a;
        this.data[i + 3] = (a / samples) * 255;
      }
    }
  }

  png() {
    return encodePng(this.size, this.size, this.data);
  }
}

function insideRoundRect(px, py, { x0, y0, x1, y1, r = 0 }) {
  const cx = Math.min(Math.max(px, x0 + r), x1 - r);
  const cy = Math.min(Math.max(py, y0 + r), y1 - r);
  return Math.hypot(px - cx, py - cy) <= r;
}

/* ---------------- png + ico encoding ---------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([head, body, crc]);
}

function encodePng(size, _height, rgba) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size * 4; x++) {
      raw[y * stride + 1 + x] = Math.max(0, Math.min(255, Math.round(rgba[y * size * 4 + x])));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = header.length + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const at = i * 16;
    dir[at] = size >= 256 ? 0 : size;
    dir[at + 1] = size >= 256 ? 0 : size;
    dir[at + 2] = 0; // palette
    dir[at + 3] = 0; // reserved
    dir.writeUInt16LE(1, at + 4); // colour planes
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

/* ---------------- mark ---------------- */

/** The three stacked bars, in normalised 0..1 coordinates. */
const BARS = [
  { x0: 0.232, x1: 0.768, y0: 0.312, y1: 0.422, color: SURFACE },
  { x0: 0.232, x1: 0.598, y0: 0.445, y1: 0.555, color: ACCENT },
  { x0: 0.232, x1: 0.702, y0: 0.578, y1: 0.688, color: SURFACE },
];

/** fullBleed: ink covers the whole square (for maskable / Apple icons). */
function mark(size, { fullBleed = false, radius = 0.22 } = {}) {
  const canvas = new Canvas(size);
  const shapes = [];
  if (fullBleed) {
    shapes.push({ x0: 0, y0: 0, x1: size, y1: size, r: 0, color: INK });
  } else {
    const r = size * radius;
    shapes.push({ x0: 0, y0: 0, x1: size, y1: size, r, color: INK });
  }
  for (const bar of BARS) {
    const h = (bar.y1 - bar.y0) * size;
    shapes.push({
      x0: bar.x0 * size,
      y0: bar.y0 * size,
      x1: bar.x1 * size,
      y1: bar.y1 * size,
      r: h / 2,
      color: bar.color,
    });
  }
  canvas.shapes(shapes, { ss: 4 });
  return canvas;
}

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Boring Internet">
  <rect width="64" height="64" rx="14" fill="#1a120b"/>
  <rect x="14.85" y="19.97" width="34.3" height="7.04" rx="3.52" fill="#fff7ee"/>
  <rect x="14.85" y="28.48" width="23.42" height="7.04" rx="3.52" fill="#d9601f"/>
  <rect x="14.85" y="36.99" width="30.08" height="7.04" rx="3.52" fill="#fff7ee"/>
</svg>
`;

/* ---------------- 5x7 wordmark font (for the OG card) ---------------- */

const GLYPHS = {
  " ": [0, 0, 0, 0, 0, 0, 0],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
};

function drawText(canvas, text, x, y, cell, color) {
  let cursor = x;
  for (const char of text) {
    const glyph = GLYPHS[char] ?? GLYPHS[" "];
    glyph.forEach((row, ry) => {
      for (let rx = 0; rx < 5; rx++) {
        if ((row >> (4 - rx)) & 1) {
          canvas.rect(cursor + rx * cell, y + ry * cell, cursor + rx * cell + cell - Math.max(1, cell * 0.14), y + ry * cell + cell - Math.max(1, cell * 0.14), color);
        }
      }
    });
    cursor += 6 * cell;
  }
  return cursor - cell;
}

/* ---------------- og card ---------------- */

function ogCard() {
  const W = 1200;
  const H = 630;
  const canvas = new Canvas(W);
  canvas.data = new Float64Array(W * H * 4);
  canvas.rect(0, 0, W, H, CREAM);

  // soft warm bloom behind the mark
  const tile = mark(230, { radius: 0.22 });
  canvas.rect(84, 200, 84 + 230, 200 + 230, CREAM);
  for (let y = 0; y < 230; y++) {
    for (let x = 0; x < 230; x++) {
      const i = (y * 230 + x) * 4;
      const a = tile.data[i + 3] / 255;
      if (a === 0) continue;
      const di = ((y + 200) * W + (x + 84)) * 4;
      for (let c = 0; c < 3; c++) {
        canvas.data[di + c] = canvas.data[di + c] * (1 - a) + tile.data[i + c] * a;
      }
    }
  }

  drawText(canvas, "BORING", 396, 214, 14, INK);
  drawText(canvas, "INTERNET", 396, 336, 14, ACCENT);
  canvas.rect(396, 474, 396 + 320, 474 + 10, INK);
  drawText(canvas, "THE LIST", 396, 512, 6, [0x6f, 0x4f, 0x36]);

  return canvas;
}

/* ---------------- write everything ---------------- */

mkdirSync(PUBLIC, { recursive: true });

const pngSizes = { "apple-touch-icon.png": [180, true], "icon-192.png": [192, true], "icon-512.png": [512, true], "icon-32.png": [32, false] };

writeFileSync(join(PUBLIC, "favicon.svg"), FAVICON_SVG);
for (const [name, [size, fullBleed]] of Object.entries(pngSizes)) {
  writeFileSync(join(PUBLIC, name), mark(size, { fullBleed }).png());
}

// favicon.ico bundles 16/32/48 rasterised PNGs for every legacy browser + tab strip.
writeFileSync(
  join(PUBLIC, "favicon.ico"),
  encodeIco([16, 32, 48].map((size) => ({ size, data: mark(size, { fullBleed: false }).png() }))),
);

const og = ogCard();
const ogPng = (() => {
  // encodePng writes a square; build a 1200x630 encoder variant inline.
  const W = og.size;
  const H = 630;
  const stride = W * 4 + 1;
  const raw = Buffer.alloc(stride * H);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < W * 4; x++) {
      raw[y * stride + 1 + x] = Math.max(0, Math.min(255, Math.round(og.data[y * W * 4 + x])));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
})();
writeFileSync(join(PUBLIC, "og.png"), ogPng);

writeFileSync(
  join(PUBLIC, "manifest.webmanifest"),
  JSON.stringify(
    {
      name: "Boring Internet",
      short_name: "Boring Internet",
      description: "A quiet list of launched sites, kept small on purpose.",
      start_url: "/",
      display: "standalone",
      background_color: "#f7e0c6",
      theme_color: "#1a120b",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  ) + "\n",
);

console.log("icons written to public/");
