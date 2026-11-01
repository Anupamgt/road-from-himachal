import { PAL, dither, drawPine, drawStone, rect } from '../art/pixel';

/** Where things sit in the game window, in art pixels. */
export interface Layout {
  W: number;
  H: number;
  yHorizon: number;
  yRoad: number;
  roadH: number;
  /** Y of the runner's feet. */
  footY: number;
  /** X of the runner's centre (left third). */
  runnerCx: number;
}

export function layoutFor(W: number, H: number): Layout {
  const yRoad = Math.round(H * 0.74);
  const roadH = H - yRoad;
  return {
    W,
    H,
    yHorizon: Math.round(H * 0.56),
    yRoad,
    roadH,
    footY: yRoad + Math.round(roadH * 0.7),
    runnerCx: Math.round(W * 0.3),
  };
}

export type SkyBand = [toFraction: number, colour: string, ditherWith: string | null];

export interface Theme {
  sky: SkyBand[];
  stars: boolean;
  far: { color: string; cap: string | null; amp: number; f1: number; f2: number; seed: number };
  mid: { color: string; tree: string | null; amp: number; f1: number; f2: number; seed: number };
  ground: string;
  groundDetail: string;
  road: string;
  edge: string;
  dash: string;
  nearTrees: { colors: string[]; density: number; minH: number; maxH: number } | null;
  stone: { top: string; face: string };
}

/** The stone sits this many art pixels right of the runner's centre when he stops. */
export const STONE_GAP = 40;

/**
 * Places things relative to the runner at the moment he stops at the stone: `at(dx)` is the screen
 * x where something that sits `dx` pixels right of the runner (when he is standing) is drawn now.
 * `speed` is the parallax speed (1 moves with the road, less is further away).
 */
export type Placer = (dx: number, speed?: number) => number;

export function placer(L: Layout, cam: number, anchorX: number): Placer {
  const camHold = anchorX - L.runnerCx - STONE_GAP;
  return (dx, speed = 1) => Math.round(L.runnerCx + dx + (camHold - cam) * speed);
}

type Draw = (ctx: CanvasRenderingContext2D, L: Layout, cam: number, t: number, at: Placer) => void;

/** A scene is a theme plus optional props drawn in world space. */
export interface Scene {
  id: string;
  theme: Theme;
  /** Draws props in front of the road and stone. `t` is time in ms; 0 under reduced motion. */
  props?: Draw;
  /** Draws behind the road and trees (between the mid ridge and the ground). */
  backdrop?: Draw;
  /** Draws on the ground, after the ground fill and before the roadside trees (a river, a highway). */
  midground?: Draw;
  /** Draws in front of the runner (a bench front, a table edge). */
  foreground?: Draw;
  /** True when the scene moves on its own (trucks passing); the game keeps redrawing it. */
  animated?: boolean;
}

const tri = (t: number): number => Math.abs((((t % 1) + 1) % 1) - 0.5) * 2;

function ridge(x: number, amp: number, f1: number, f2: number, s: number): number {
  return amp * (0.62 * tri(x * f1 + s) + 0.38 * tri(x * f2 + s * 2.3));
}

/** Deterministic hash in [0, 1) for a world cell, so scenery is endless and never changes. */
export function hash(n: number, seed = 0): number {
  let h = (Math.imul(n | 0, 374761393) + Math.imul(seed | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const PARALLAX = { far: 0.12, mid: 0.4, near: 1 };

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  cam: number,
  scene: Scene,
  stone: { worldX: number; label: string | null } | null,
  t: number,
): void {
  const { W, H, yHorizon, yRoad } = L;
  const th = scene.theme;
  ctx.imageSmoothingEnabled = false;

  // Sky: flat bands, dithered seams.
  let y0 = 0;
  for (const [to, a, b] of th.sky) {
    const y1 = Math.round(yHorizon * to);
    if (b) dither(ctx, 0, y0, W, y1 - y0, a, b);
    else rect(ctx, 0, y0, W, y1 - y0, a);
    y0 = y1;
  }
  if (th.stars) {
    const off = Math.floor(cam * 0.03);
    for (let i = 0; i < W; i += 1) {
      const wx = i + off;
      if (hash(wx, 3) < 0.018) {
        const sy = Math.floor(hash(wx, 4) * yHorizon * 0.5);
        rect(ctx, i, sy, 1, 1, hash(wx, 5) < 0.2 ? PAL.yellow : PAL.snow);
      }
    }
  }

  // Far ridge.
  const far = th.far;
  const farOff = cam * PARALLAX.far;
  for (let x = 0; x < W; x++) {
    const h = Math.round(ridge(x + farOff, far.amp * H, far.f1, far.f2, far.seed) + H * 0.05);
    rect(ctx, x, yHorizon - h, 1, h, far.color);
    if (far.cap) {
      const capDepth = Math.max(0, Math.round((h - far.amp * H * 0.55) * 0.45));
      if (capDepth > 0) {
        rect(ctx, x, yHorizon - h, 1, capDepth, far.cap);
        if (((x + Math.floor(farOff)) & 3) === 0) rect(ctx, x, yHorizon - h + capDepth, 1, 1, far.cap);
      }
    }
  }

  // Mid ridge with small trees on the crest.
  const mid = th.mid;
  const midOff = cam * PARALLAX.mid;
  const tops: number[] = [];
  for (let x = 0; x < W; x++) {
    const h = Math.round(ridge(x + midOff, mid.amp * H, mid.f1, mid.f2, mid.seed) + H * 0.03);
    tops.push(yHorizon - h);
    rect(ctx, x, yHorizon - h, 1, h + 1, mid.color);
  }
  if (mid.tree) {
    const cell = 8;
    const first = Math.floor(midOff / cell);
    for (let k = first - 1; k <= first + Math.ceil(W / cell) + 1; k++) {
      if (hash(k, mid.seed) < 0.62) {
        const sx = Math.round(k * cell + hash(k, mid.seed + 1) * cell - midOff);
        if (sx < 0 || sx >= W) continue;
        drawPine(ctx, sx, tops[sx] + 3, 8 + Math.floor(hash(k, mid.seed + 2) * 5), mid.tree);
      }
    }
  }

  const at = placer(L, cam, stone?.worldX ?? cam + L.runnerCx + STONE_GAP);
  scene.backdrop?.(ctx, L, cam, t, at);

  // Ground up to the road.
  rect(ctx, 0, yHorizon, W, yRoad - yHorizon + 1, th.ground);
  dither(ctx, 0, yHorizon, W, 3, th.groundDetail, th.ground);
  const g0 = Math.floor(cam);
  for (let i = 0; i < W; i++) {
    const wx = i + g0;
    if (hash(wx, 11) < 0.05) {
      const gy = yHorizon + 4 + Math.floor(hash(wx, 12) * (yRoad - yHorizon - 6));
      rect(ctx, i, gy, 2, 1, th.groundDetail);
    }
  }

  scene.midground?.(ctx, L, cam, t, at);

  // Roadside trees at full speed, based on the verge.
  const nt = th.nearTrees;
  if (nt) {
    const cell = 26;
    const first = Math.floor(cam / cell);
    for (let k = first - 1; k <= first + Math.ceil(W / cell) + 2; k++) {
      if (hash(k, 31) < nt.density) {
        const sx = Math.round(k * cell + hash(k, 32) * (cell - 8) - cam);
        const h = nt.minH + Math.floor(hash(k, 33) * (nt.maxH - nt.minH));
        const c = nt.colors[Math.floor(hash(k, 34) * nt.colors.length)];
        drawPine(ctx, sx, yRoad - 1 - Math.floor(hash(k, 35) * 4), h, c);
      }
    }
  }

  // Road.
  rect(ctx, 0, yRoad, W, L.roadH, th.road);
  rect(ctx, 0, yRoad, W, 1, th.edge);
  rect(ctx, 0, H - 2, W, 1, th.edge);
  const dashY = yRoad + Math.round(L.roadH * 0.5);
  const period = 24;
  const dOff = ((Math.floor(cam) % period) + period) % period;
  for (let x = -dOff; x < W; x += period) rect(ctx, x, dashY, 12, 2, th.dash);

  // Kilometre stone.
  if (stone && stone.label !== null) {
    const sx = Math.round(stone.worldX - cam);
    if (sx > -24 && sx < W + 24) {
      drawStone(ctx, sx - 8, yRoad - 21, stone.label, { w: 16, h: 24, top: th.stone.top, face: th.stone.face });
    }
  }

  scene.props?.(ctx, L, cam, t, at);
}
