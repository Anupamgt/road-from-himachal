import { PAL, disc, outline, rect } from './pixel';

// Hand-built pixel props shared by the scenes. Every function draws at integer coordinates;
// `y` is always the ground line the prop stands on.

type Ctx = CanvasRenderingContext2D;

/** Pole with a flag. */
export function drawFlag(ctx: Ctx, x: number, y: number, h: number, flag: string): void {
  rect(ctx, x, y - h, 1, h, PAL.ink);
  rect(ctx, x + 1, y - h, 8, 5, flag);
  rect(ctx, x + 8, y - h + 2, 1, 1, PAL.ink); // a notch in the flag's trailing edge
  rect(ctx, x - 1, y - 1, 3, 1, PAL.ink);
}

/** Orange-red traffic cone with a snow stripe (ember, so dusk orange stays for the turning point). */
export function drawCone(ctx: Ctx, x: number, y: number): void {
  rect(ctx, x, y - 1, 8, 1, PAL.ink);
  rect(ctx, x + 1, y - 3, 6, 2, PAL.ember);
  rect(ctx, x + 2, y - 4, 4, 1, PAL.snow);
  rect(ctx, x + 2, y - 6, 4, 2, PAL.ember);
  rect(ctx, x + 3, y - 8, 2, 2, PAL.ember);
}

/** Road roller: yellow body, ink cab, a big front drum and a rear wheel. */
export function drawRoller(ctx: Ctx, x: number, y: number): void {
  disc(ctx, x + 8, y - 8, 8, PAL.stone);
  disc(ctx, x + 8, y - 8, 3, PAL.ink);
  rect(ctx, x + 14, y - 15, 24, 9, PAL.yellow);
  rect(ctx, x + 14, y - 7, 24, 2, PAL.ink);
  rect(ctx, x + 7, y - 15, 8, 3, PAL.yellow); // bonnet arm over the drum
  // cab
  rect(ctx, x + 22, y - 27, 14, 12, PAL.ink);
  rect(ctx, x + 24, y - 25, 10, 7, PAL.sky);
  rect(ctx, x + 21, y - 29, 16, 2, PAL.ink);
  rect(ctx, x + 18, y - 21, 3, 6, PAL.ink); // exhaust
  disc(ctx, x + 33, y - 6, 6, PAL.ink);
  disc(ctx, x + 33, y - 6, 2, PAL.stone);
}

export interface FigureOpts {
  phone?: boolean;
}

/** Site engineer: yellow hard hat, ember vest, holding a lit phone up. */
export function drawEngineer(ctx: Ctx, x: number, y: number, opts: FigureOpts = {}): void {
  // legs and boots
  rect(ctx, x + 2, y - 9, 2, 9, PAL.night);
  rect(ctx, x + 5, y - 9, 2, 9, PAL.night);
  rect(ctx, x + 1, y - 1, 4, 1, PAL.ink);
  rect(ctx, x + 5, y - 1, 4, 1, PAL.ink);
  // torso: shirt with an ember vest and a snow stripe
  rect(ctx, x + 1, y - 18, 7, 9, PAL.mist);
  rect(ctx, x + 2, y - 18, 5, 9, PAL.ember);
  rect(ctx, x + 2, y - 14, 5, 1, PAL.snow);
  // head and hard hat
  rect(ctx, x + 2, y - 24, 5, 5, PAL.skin);
  rect(ctx, x + 1, y - 26, 7, 3, PAL.yellow);
  rect(ctx, x + 7, y - 24, 1, 1, PAL.ink); // eye
  // arm raised with the phone
  if (opts.phone) {
    rect(ctx, x + 7, y - 17, 2, 2, PAL.skin);
    rect(ctx, x + 8, y - 22, 2, 6, PAL.skin);
    rect(ctx, x + 9, y - 28, 5, 7, PAL.ink);
    rect(ctx, x + 10, y - 27, 3, 5, PAL.snow);
    // light thrown from the screen: a few dithered pixels
    for (let i = 0; i < 4; i++) rect(ctx, x + 15 + i * 2, y - 27 + i * 2, 1, 1, PAL.yellow);
    rect(ctx, x + 14, y - 30, 1, 1, PAL.yellow);
  } else {
    rect(ctx, x + 7, y - 17, 2, 7, PAL.skin);
  }
}

/** A phone showing the SiteWatch-style form (fallback when there is no screenshot). */
export function drawPhoneForm(ctx: Ctx, x: number, y: number, w = 24, h = 38): void {
  rect(ctx, x, y, w, h, PAL.ink);
  rect(ctx, x + 2, y + 3, w - 4, h - 6, PAL.snow);
  rect(ctx, x + 2, y + 3, w - 4, 4, PAL.yellow);
  for (let i = 0; i < 4; i++) {
    const ry = y + 10 + i * 6;
    rect(ctx, x + 4, ry, 6, 2, PAL.stone); // label
    rect(ctx, x + 11, ry, w - 15, 2, i === 3 ? PAL.stone : PAL.ink); // filled value
  }
  rect(ctx, x + 4, y + h - 8, w - 8, 3, PAL.moss);
  rect(ctx, x + Math.floor(w / 2) - 2, y + 1, 4, 1, PAL.stone);
}

/** Laptop on a table: the screen shows a small map of outlined land parcels. */
export function drawLaptopMap(ctx: Ctx, x: number, y: number, showMap = true): void {
  // screen
  rect(ctx, x, y - 14, 20, 13, PAL.ink);
  if (showMap) {
    rect(ctx, x + 1, y - 13, 18, 11, PAL.mist);
    rect(ctx, x + 2, y - 12, 7, 5, PAL.leaf);
    outline(ctx, x + 2, y - 12, 7, 5, PAL.ink);
    rect(ctx, x + 10, y - 12, 8, 3, PAL.skin);
    outline(ctx, x + 10, y - 12, 8, 3, PAL.ink);
    rect(ctx, x + 10, y - 8, 8, 5, PAL.moss);
    outline(ctx, x + 10, y - 8, 8, 5, PAL.ink);
    rect(ctx, x + 2, y - 6, 7, 3, PAL.sky);
    outline(ctx, x + 2, y - 6, 7, 3, PAL.ink);
  }
  // base
  rect(ctx, x - 2, y - 1, 24, 2, PAL.stone);
}

/** Field table with two legs. */
export function drawTable(ctx: Ctx, x: number, y: number, w: number): void {
  rect(ctx, x, y - 12, w, 2, PAL.chai);
  rect(ctx, x + 2, y - 10, 2, 10, PAL.chai);
  rect(ctx, x + w - 4, y - 10, 2, 10, PAL.chai);
  rect(ctx, x, y - 12, w, 1, PAL.skin);
}

/** Road sign: yellow diamond with a chevron, on a post. */
export function drawChevronSign(ctx: Ctx, x: number, y: number): void {
  rect(ctx, x + 5, y - 10, 2, 10, PAL.asphalt);
  const cx = x + 6;
  const cy = y - 17;
  for (let dy = -6; dy <= 6; dy++) {
    const half = 6 - Math.abs(dy);
    rect(ctx, cx - half, cy + dy, half * 2 + 1, 1, PAL.yellow);
  }
  // chevron
  rect(ctx, cx - 1, cy - 3, 1, 1, PAL.ink);
  rect(ctx, cx, cy - 2, 1, 1, PAL.ink);
  rect(ctx, cx + 1, cy - 1, 1, 1, PAL.ink);
  rect(ctx, cx, cy, 1, 1, PAL.ink);
  rect(ctx, cx - 1, cy + 1, 1, 1, PAL.ink);
}

/** Street lamp with a lit head; the light on the ground is a dithered patch, not a glow. */
export function drawLamp(ctx: Ctx, x: number, y: number, h: number, ground: string): void {
  rect(ctx, x, y - h, 2, h, PAL.asphalt);
  rect(ctx, x - 2, y - h - 2, 6, 2, PAL.asphalt);
  rect(ctx, x - 1, y - h, 4, 1, PAL.yellow);
  ctx.fillStyle = PAL.yellow;
  for (let j = 0; j < 3; j++) {
    for (let i = (j & 1); i < 12; i += 2) ctx.fillRect(x - 5 + i, y - 2 + j + 1, 1, 1);
  }
  rect(ctx, x - 6, y + 2, 14, 1, ground);
}

/** A long block of hostel with lit windows (deterministic pattern). */
export function drawHostel(ctx: Ctx, x: number, yBottom: number, w: number, floors: number, seed: number): void {
  const h = floors * 8 + 4;
  rect(ctx, x, yBottom - h, w, h, PAL.asphalt);
  rect(ctx, x - 1, yBottom - h - 2, w + 2, 2, PAL.stone);
  for (let f = 0; f < floors; f++) {
    for (let i = 4; i + 4 < w; i += 8) {
      const lit = ((i * 7 + f * 13 + seed * 5) % 10) < 6;
      rect(ctx, x + i, yBottom - h + 4 + f * 8, 4, 4, lit ? PAL.yellow : PAL.night);
    }
  }
}

/** Gate pillar: snow body with an ink shaded edge and a cap. */
export function drawPillar(ctx: Ctx, x: number, y: number, h: number): void {
  rect(ctx, x, y - h, 8, h, PAL.mist);
  rect(ctx, x + 6, y - h, 2, h, PAL.stone);
  rect(ctx, x - 1, y - h - 3, 10, 3, PAL.snow);
  rect(ctx, x - 1, y - h - 1, 10, 1, PAL.stone);
}

/** Tower crane silhouette. */
export function drawCrane(ctx: Ctx, x: number, yBottom: number, h: number): void {
  rect(ctx, x, yBottom - h, 3, h, PAL.yellow);
  for (let j = 0; j < h; j += 4) rect(ctx, x, yBottom - h + j, 3, 1, PAL.ink);
  rect(ctx, x - 14, yBottom - h - 3, 44, 3, PAL.yellow);
  rect(ctx, x + 22, yBottom - h, 6, 6, PAL.stone);
  rect(ctx, x - 12, yBottom - h, 1, 14, PAL.ink); // cable
  rect(ctx, x - 14, yBottom - h + 14, 5, 3, PAL.ink); // hook block
}

/** Fleet truck seen from the side, driving right; silhouetted at dusk with lit headlights. */
export function drawTruck(ctx: Ctx, x: number, y: number): void {
  rect(ctx, x, y - 11, 20, 9, PAL.stone); // trailer: lighter than the road so it reads at dusk
  rect(ctx, x, y - 11, 20, 1, PAL.mist);
  rect(ctx, x + 6, y - 9, 1, 6, PAL.asphalt); // panel lines
  rect(ctx, x + 13, y - 9, 1, 6, PAL.asphalt);
  rect(ctx, x + 21, y - 8, 8, 6, PAL.ink); // cab
  rect(ctx, x + 25, y - 8, 4, 3, PAL.sky);
  rect(ctx, x + 1, y - 4, 27, 2, PAL.ink); // chassis
  for (const wx of [3, 8, 22]) {
    rect(ctx, x + wx, y - 3, 4, 4, PAL.ink);
    rect(ctx, x + wx + 1, y - 2, 2, 2, PAL.stone);
  }
  // headlights and a short beam
  rect(ctx, x + 29, y - 4, 1, 2, PAL.yellow);
  rect(ctx, x + 30, y - 3, 4, 1, PAL.yellow);
  rect(ctx, x + 30, y - 4, 3, 1, PAL.snow);
}
