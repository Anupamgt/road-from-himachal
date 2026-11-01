// Pixel-art helpers. Everything draws in integer coordinates on a low-resolution canvas,
// using only the 16 project colours.

export const PAL = {
  deepPine: '#142a1d',
  pine: '#1f3d2b',
  moss: '#3e6b48',
  leaf: '#7fa66a',
  mist: '#dde5df',
  snow: '#f7f5f0',
  asphalt: '#2b2f33',
  stone: '#6b7177',
  yellow: '#f2c230',
  orange: '#e8743b',
  ember: '#b9472a',
  night: '#1b2440',
  sky: '#6e9fc9',
  chai: '#7a4a2b',
  skin: '#c98e6a',
  ink: '#15171a',
} as const;

export type Colour = (typeof PAL)[keyof typeof PAL];

export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Ordered 50% dither between two colours: a flat step with a checkerboard seam. */
export function dither(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  a: string,
  b: string,
): void {
  rect(ctx, x, y, w, h, a);
  ctx.fillStyle = b;
  for (let j = 0; j < h; j++) {
    for (let i = (j + x) & 1; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  }
}

/** Small deterministic random generator so scenes draw the same every time. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

// 3x5 digit font for kilometre numbers and signs.
const DIGITS: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  '.': ['000', '000', '000', '000', '010'],
};

// 3x5 capital letters for signs and banners (drawn at scale 1 or 2).
const LETTERS: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['110', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '110', '011'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
  V: ['101', '101', '101', '101', '010'],
  W: ['101', '101', '111', '111', '101'],
  X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'],
  Z: ['111', '001', '010', '100', '111'],
};

export function digitsWidth(text: string, scale = 1): number {
  return text.length * 4 * scale - scale;
}

export function drawDigits(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  c: string,
  scale = 1,
): void {
  ctx.fillStyle = c;
  let cx = x;
  for (const ch of text) {
    const g = DIGITS[ch];
    if (g) {
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 3; i++) {
          if (g[j][i] === '1') ctx.fillRect(cx + i * scale, y + j * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
}

/** Sign lettering: capitals, digits and spaces from the 3x5 fonts. Returns the drawn width. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  c: string,
  scale = 1,
): number {
  ctx.fillStyle = c;
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const g = LETTERS[ch] ?? DIGITS[ch];
    if (g) {
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 3; i++) {
          if (g[j][i] === '1') ctx.fillRect(cx + i * scale, y + j * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
  return cx - x - scale;
}

export function textWidth(text: string, scale = 1): number {
  return text.length * 4 * scale - scale;
}

/** Filled disc, drawn row by row so the edge stays stepped. */
export function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string): void {
  ctx.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.4);
    ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}

/** One-pixel outline of a rectangle. */
export function outline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

/** Kilometre stone: white body, yellow top, ink outline, number on the face. */
export function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  opts: { w?: number; h?: number; top?: string; face?: string } = {},
): void {
  const w = opts.w ?? 14;
  const h = opts.h ?? 20;
  const top = opts.top ?? PAL.yellow;
  const face = opts.face ?? PAL.snow;
  const topH = Math.round(h * 0.32);
  // outline with one-pixel stepped corners
  rect(ctx, x + 1, y, w - 2, h, PAL.ink);
  rect(ctx, x, y + 1, w, h - 2, PAL.ink);
  // fill
  rect(ctx, x + 2, y + 1, w - 4, topH, top);
  rect(ctx, x + 1, y + 2, w - 2, topH - 1, top);
  rect(ctx, x + 1, y + 1 + topH, w - 2, h - topH - 2, face);
  // shade on the right side
  rect(ctx, x + w - 3, y + 1 + topH, 2, h - topH - 2, PAL.mist);
  const dw = digitsWidth(label);
  drawDigits(ctx, label, x + Math.round((w - dw) / 2), y + topH + 3, PAL.ink);
}

/** Pine tree, drawn as stacked widening rows. */
export function drawPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  body: string,
  trunk: string = PAL.chai,
): void {
  const trunkH = Math.max(2, Math.round(h * 0.18));
  rect(ctx, x, baseY - trunkH, 1, trunkH, trunk);
  const rows = h - trunkH;
  const maxHalf = Math.max(1, Math.round(h / 4));
  const tierH = Math.max(2, Math.round(rows / 3));
  for (let r = 0; r < rows; r++) {
    // each tier restarts a little narrower than the one above it ended
    const inTier = r % tierH;
    const tier = Math.floor(r / tierH);
    const half = Math.min(maxHalf, Math.floor(((tier * 0.45 + (inTier / tierH) * 0.75) * maxHalf) / 1.2) + (r > 0 ? 1 : 0));
    rect(ctx, x - half, baseY - h + r, half * 2 + 1, 1, body);
  }
}
