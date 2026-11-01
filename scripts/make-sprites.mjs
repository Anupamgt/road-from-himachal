// Generates PLACEHOLDER sprites in the project palette so the engine can be built before the
// real art exists. Replace public/sprites/runner_sheet_1x.png and portrait_32.png with the real
// files; no code change is needed (same sizes: 10 frames of 64x64, and 32x32).
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const C = {
  skin: [0xc9, 0x8e, 0x6a],
  ink: [0x15, 0x17, 0x1a],
  snow: [0xf7, 0xf5, 0xf0],
  sky: [0x6e, 0x9f, 0xc9],
  night: [0x1b, 0x24, 0x40],
  yellow: [0xf2, 0xc2, 0x30],
  pine: [0x1f, 0x3d, 0x2b],
  leaf: [0x7f, 0xa6, 0x6a],
  mist: [0xdd, 0xe5, 0xdf],
};

class Img {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8Array(w * h * 4); // transparent
  }
  px(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0];
    this.d[i + 1] = c[1];
    this.d[i + 2] = c[2];
    this.d[i + 3] = 255;
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }
  // Thick line stamped with square brushes.
  line(x0, y0, x1, y1, t, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= n; s++) {
      const x = x0 + ((x1 - x0) * s) / n;
      const y = y0 + ((y1 - y0) * s) / n;
      this.rect(Math.round(x - t / 2), Math.round(y - t / 2), t, t, c);
    }
  }
  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.d[i + 3]) this.px(dx + x, dy + y, [src.d[i], src.d[i + 1], src.d[i + 2]]);
      }
    }
  }
}

function encodePng(img) {
  const crcTable = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.w, 0);
  ihdr.writeUInt32BE(img.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((img.w * 4 + 1) * img.h);
  for (let y = 0; y < img.h; y++) {
    raw[y * (img.w * 4 + 1)] = 0;
    Buffer.from(img.d.buffer, y * img.w * 4, img.w * 4).copy(raw, y * (img.w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// One 64x64 runner frame, facing right, feet on y = 60.
function runnerFrame(kind, phase) {
  const f = new Img(64, 64);
  const hipX = 32;
  const hipY = 40;
  const lean = kind === 'breath' ? 6 : 0;
  const drop = kind === 'breath' ? 5 : 0;

  // Legs
  const legs = (offset, shade) => {
    if (kind === 'run') {
      const s = Math.sin(phase + offset);
      const lift = Math.max(0, Math.cos(phase + offset)) * 7;
      const footX = hipX + s * 11;
      const footY = 58 - lift;
      const kneeX = hipX + s * 5 + 3;
      const kneeY = 50 - lift * 0.5;
      f.line(hipX, hipY, kneeX, kneeY, 5, shade);
      f.line(kneeX, kneeY, footX, footY, 5, shade);
      f.rect(Math.round(footX - 3), Math.round(footY), 9, 3, C.ink);
    } else if (kind === 'breath') {
      const x = hipX + 5 + offset * 4;
      f.line(hipX + lean * 0.5, hipY + drop, x, 52, 5, shade);
      f.line(x, 52, x - 1 + offset * 3, 58, 5, shade);
      f.rect(x - 4 + offset * 3, 58, 9, 3, C.ink);
    } else {
      const x = hipX + offset * 3;
      f.line(x, hipY, x, 57, 5, shade);
      f.rect(x - 3, 58, 9, 3, C.ink);
    }
  };
  legs(Math.PI, C.night);

  // Torso (shirt in sky blue, shorts night blue)
  f.rect(hipX - 5 + lean, 25 + drop, 11, 15, C.sky);
  f.rect(hipX - 5 + lean * 0.5, 38 + drop, 11, 5, C.night);

  // Head
  const hx = hipX - 4 + lean + (kind === 'breath' ? 3 : 0);
  const hy = 13 + drop + (kind === 'breath' ? 3 : 0);
  f.rect(hx, hy, 10, 10, C.skin);
  f.rect(hx - 1, hy - 2, 11, 5, C.ink); // hair
  f.rect(hx - 1, hy, 3, 8, C.ink);
  f.rect(hx + 6, hy + 4, 2, 2, C.ink); // eye
  f.rect(hx, hy - 3, 10, 2, C.yellow); // headband

  // Arms
  const arm = (offset, shade) => {
    const sx = hipX + lean * 0.8;
    const sy = 28 + drop;
    if (kind === 'run') {
      const s = Math.sin(phase + offset);
      const ex = sx + 4 + s * 4;
      const ey = sy + 8;
      const hxx = ex + 6 + s * 5;
      const hyy = ey - 3 + Math.abs(s) * -2;
      f.line(sx, sy, ex, ey, 4, shade);
      f.line(ex, ey, hxx, hyy, 4, shade);
    } else if (kind === 'breath') {
      f.line(sx, sy, sx + 5, sy + 10, 4, shade);
      f.line(sx + 5, sy + 10, hipX + 9, 50, 4, shade);
    } else {
      f.line(sx, sy, sx + 1 + offset, sy + 13, 4, shade);
    }
  };
  arm(0, C.skin);
  legs(0, C.night);
  arm(Math.PI, C.skin);
  return f;
}

// The title-screen poses: frame 0 faces the screen, frame 1 is the three-quarter turn on the way
// to the side-on run. 64x64 each, feet on y = 60, same palette as the runner.
function frontFrame(turn) {
  const f = new Img(64, 64);
  const o = turn ? 2 : 0; // the turn shifts the face and body toward the direction of travel
  const legX = turn ? [29, 35] : [28, 36];
  for (const x of legX) {
    f.line(x, 40, x, 57, 5, C.night);
    f.rect(x - 3, 58, turn ? 9 : 7, 3, C.ink);
  }
  const torsoW = turn ? 12 : 14;
  f.rect(32 - torsoW / 2 + o / 2, 25, torsoW, 15, C.sky);
  f.rect(32 - torsoW / 2 + o / 2, 38, torsoW, 5, C.night);
  f.rect(30 + o, 23, 4, 3, C.skin); // neck
  // arms hang at the sides; the far arm is mostly hidden in the turn
  const armL = 32 - torsoW / 2 - 3 + o / 2;
  const armR = 32 + torsoW / 2 - 1 + o / 2;
  if (!turn) f.rect(armL, 25, 4, 6, C.sky);
  if (!turn) f.rect(armL, 31, 3, 10, C.skin);
  f.rect(armR, 25, 4, 6, C.sky);
  f.rect(armR + 1, 31, 3, 10, C.skin);
  // head
  f.rect(27 + o, 13, 10, 10, C.skin);
  f.rect(26 + o, 11, 12, 5, C.ink); // hair
  f.rect(26 + o, 13, turn ? 4 : 2, 7, C.ink);
  f.rect(36 + o, 13, 2, 6, C.ink);
  f.rect(26 + o, 10, 12, 2, C.yellow); // headband
  f.rect(29 + o + (turn ? 2 : 0), 17, 2, 2, C.ink); // eyes
  f.rect(33 + o + (turn ? 1 : 0), 17, 2, 2, C.ink);
  f.rect(30 + o + (turn ? 2 : 0), 20, 4, 1, C.ink); // mouth
  return f;
}

const sheet = new Img(640, 64);
for (let i = 0; i < 8; i++) sheet.blit(runnerFrame('run', (i / 8) * Math.PI * 2), i * 64, 0);
sheet.blit(runnerFrame('stand', 0), 8 * 64, 0);
sheet.blit(runnerFrame('breath', 0), 9 * 64, 0);

const portrait = new Img(32, 32);
portrait.rect(0, 0, 32, 32, C.pine);
portrait.rect(0, 24, 32, 8, C.night);
portrait.rect(8, 22, 16, 10, C.sky); // shoulders
portrait.rect(10, 6, 12, 15, C.skin); // face
portrait.rect(9, 3, 14, 6, C.ink); // hair
portrait.rect(9, 6, 3, 10, C.ink);
portrait.rect(12, 12, 2, 2, C.ink); // eyes
portrait.rect(18, 12, 2, 2, C.ink);
portrait.rect(13, 17, 6, 1, C.ink); // mouth
portrait.rect(9, 3, 14, 2, C.yellow); // headband

mkdirSync(new URL('../public/sprites/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/sprites/runner_sheet_1x.png', import.meta.url), encodePng(sheet));
writeFileSync(new URL('../public/sprites/portrait_32.png', import.meta.url), encodePng(portrait));
const front = new Img(128, 64);
front.blit(frontFrame(false), 0, 0);
front.blit(frontFrame(true), 64, 0);
writeFileSync(new URL('../public/sprites/runner_front.png', import.meta.url), encodePng(front));
console.log('wrote placeholder sprites (replace with the real art)');
