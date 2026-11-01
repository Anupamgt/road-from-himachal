import { PAL, disc, rect } from './pixel';

// 14x14 pixel icons, drawn from rectangles so they stay crisp at any whole-number scale.
// The ids match content.ts: the seven items and the three skills.

type Ctx = CanvasRenderingContext2D;
type IconFn = (ctx: Ctx) => void;

const ICONS: Record<string, IconFn> = {
  'shield-coin': (c) => {
    for (let r = 0; r < 14; r++) {
      const w = r <= 8 ? 12 : Math.max(2, 12 - (r - 8) * 2);
      const x0 = 7 - w / 2;
      rect(c, x0, r, w, 1, PAL.ink);
      if (r >= 1 && r <= 12 && w > 2) rect(c, x0 + 1, r, w - 2, 1, PAL.sky);
    }
    disc(c, 7, 6, 3, PAL.yellow);
    rect(c, 6, 5, 2, 2, PAL.ink);
  },
  'bag-chart': (c) => {
    rect(c, 4, 1, 6, 1, PAL.ink);
    rect(c, 4, 2, 1, 2, PAL.ink);
    rect(c, 9, 2, 1, 2, PAL.ink);
    rect(c, 2, 3, 10, 10, PAL.ink);
    rect(c, 3, 4, 8, 8, PAL.yellow);
    rect(c, 4, 9, 2, 2, PAL.ink);
    rect(c, 7, 7, 2, 4, PAL.ink);
    rect(c, 10, 5, 1, 6, PAL.ember);
  },
  'magnifier-card': (c) => {
    rect(c, 0, 3, 9, 10, PAL.ink);
    rect(c, 1, 4, 7, 8, PAL.snow);
    rect(c, 2, 6, 5, 1, PAL.stone);
    rect(c, 2, 8, 5, 1, PAL.stone);
    rect(c, 2, 10, 3, 1, PAL.stone);
    disc(c, 9, 5, 4, PAL.ink);
    disc(c, 9, 5, 3, PAL.sky);
    rect(c, 11, 8, 2, 2, PAL.ink);
    rect(c, 12, 10, 2, 2, PAL.ink);
    rect(c, 13, 12, 1, 2, PAL.ink);
  },
  'loop-arrow': (c) => {
    rect(c, 2, 2, 10, 2, PAL.leaf);
    rect(c, 10, 2, 2, 10, PAL.leaf);
    rect(c, 2, 10, 10, 2, PAL.leaf);
    rect(c, 2, 6, 2, 6, PAL.leaf);
    // arrow head on the left bar, pointing up
    rect(c, 0, 6, 6, 1, PAL.ink);
    rect(c, 1, 5, 4, 1, PAL.ink);
    rect(c, 2, 4, 2, 1, PAL.ink);
  },
  'phone-waves': (c) => {
    rect(c, 1, 0, 7, 13, PAL.ink);
    rect(c, 2, 1, 5, 9, PAL.sky);
    rect(c, 3, 11, 3, 1, PAL.stone);
    rect(c, 9, 4, 1, 3, PAL.yellow);
    rect(c, 11, 3, 1, 5, PAL.yellow);
    rect(c, 13, 2, 1, 7, PAL.yellow);
  },
  factory: (c) => {
    rect(c, 9, 0, 2, 7, PAL.stone);
    rect(c, 8, 0, 4, 1, PAL.ink);
    rect(c, 1, 6, 12, 8, PAL.ink);
    rect(c, 2, 7, 10, 6, PAL.mist);
    rect(c, 2, 5, 3, 2, PAL.ink);
    rect(c, 5, 4, 3, 3, PAL.ink);
    rect(c, 3, 8, 2, 2, PAL.yellow);
    rect(c, 6, 8, 2, 2, PAL.yellow);
    rect(c, 9, 8, 2, 2, PAL.yellow);
    rect(c, 6, 11, 2, 3, PAL.ink);
  },
  scroll: (c) => {
    rect(c, 1, 0, 12, 2, PAL.chai);
    rect(c, 1, 12, 12, 2, PAL.chai);
    rect(c, 2, 2, 10, 10, PAL.snow);
    rect(c, 4, 4, 6, 1, PAL.ink);
    rect(c, 4, 6, 6, 1, PAL.ink);
    rect(c, 4, 8, 4, 1, PAL.ink);
    rect(c, 9, 9, 2, 2, PAL.ember);
  },
  person: (c) => {
    disc(c, 7, 4, 3, PAL.skin);
    rect(c, 5, 1, 5, 2, PAL.ink);
    rect(c, 3, 8, 8, 6, PAL.sky);
    rect(c, 3, 8, 8, 1, PAL.ink);
  },
  flag: (c) => {
    rect(c, 2, 0, 2, 14, PAL.ink);
    rect(c, 4, 1, 9, 6, PAL.yellow);
    rect(c, 4, 1, 9, 1, PAL.ink);
    rect(c, 12, 3, 1, 2, PAL.ink);
  },
  chip: (c) => {
    rect(c, 3, 3, 8, 8, PAL.ink);
    rect(c, 4, 4, 6, 6, PAL.moss);
    rect(c, 6, 6, 2, 2, PAL.leaf);
    for (const i of [4, 7, 10]) {
      rect(c, 1, i, 2, 1, PAL.stone);
      rect(c, 11, i, 2, 1, PAL.stone);
      rect(c, i, 1, 1, 2, PAL.stone);
      rect(c, i, 11, 1, 2, PAL.stone);
    }
  },
};

export const ICON_SIZE = 14;

export function hasIcon(id: string): boolean {
  return id in ICONS;
}

/** Draws an icon with its top-left corner at (x, y), scaled by a whole number. */
export function drawIcon(ctx: Ctx, id: string, x: number, y: number, scale = 1): void {
  const fn = ICONS[id];
  if (!fn) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  fn(ctx);
  ctx.restore();
}

/** A ready canvas holding one icon at `scale`, for HTML (inventory slots, flights, skills). */
export function iconCanvas(id: string, scale: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = ICON_SIZE * scale;
  c.height = ICON_SIZE * scale;
  c.className = 'px-icon';
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  drawIcon(ctx, id, 0, 0, scale);
  return c;
}
