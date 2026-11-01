import { PAL, drawText, rect, textWidth } from '../art/pixel';
import { runtime } from '../runtime';
import { hash, type Scene } from './base';

const SHIRTS = [PAL.sky, PAL.ember, PAL.leaf, PAL.yellow, PAL.snow, PAL.moss];
const CONFETTI = [PAL.yellow, PAL.sky, PAL.ember, PAL.leaf, PAL.snow, PAL.mist];

function spectator(ctx: CanvasRenderingContext2D, x: number, y: number, i: number, wave: boolean): void {
  const shirt = SHIRTS[i % SHIRTS.length];
  rect(ctx, x + 1, y - 8, 4, 8, PAL.night);
  rect(ctx, x, y - 16, 6, 8, shirt);
  rect(ctx, x + 1, y - 21, 4, 5, i % 2 ? PAL.skin : PAL.chai);
  rect(ctx, x + 1, y - 22, 4, 2, PAL.ink);
  // arms: one waving up when `wave`
  rect(ctx, x - 1, y - 15, 1, 5, PAL.skin);
  if (wave) rect(ctx, x + 6, y - 22, 1, 7, PAL.skin);
  else rect(ctx, x + 6, y - 15, 1, 5, PAL.skin);
}

/** The finish: an arch with a FINISH banner, a tape that breaks, spectators and confetti. */
export const finish: Scene = {
  id: 'finish',
  animated: true,
  theme: {
    sky: [
      [0.4, PAL.sky, null],
      [0.5, PAL.sky, PAL.mist],
      [0.78, PAL.mist, null],
      [0.86, PAL.mist, PAL.yellow],
      [1, PAL.yellow, null],
    ],
    stars: false,
    far: { color: PAL.stone, cap: PAL.snow, amp: 0.3, f1: 0.011, f2: 0.027, seed: 6.6 },
    mid: { color: PAL.moss, tree: PAL.pine, amp: 0.12, f1: 0.02, f2: 0.05, seed: 2.2 },
    ground: PAL.leaf,
    groundDetail: PAL.moss,
    road: PAL.asphalt,
    edge: PAL.snow,
    dash: PAL.yellow,
    nearTrees: { colors: [PAL.pine, PAL.moss], density: 0.3, minH: 22, maxH: 34 },
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  midground(ctx, L, _cam, t, at) {
    // barrier along the verge with spectators behind it
    const y = L.yRoad - 2;
    for (let k = -4; k < 12; k++) {
      const x = at(-100 + k * 22);
      spectator(ctx, x, y - 4, k + 4, Math.floor(t / 300 + k) % 2 === 0);
    }
    rect(ctx, 0, y - 6, L.W, 2, PAL.yellow);
    rect(ctx, 0, y - 4, L.W, 4, PAL.ink);
    for (let x = 0; x < L.W; x += 12) rect(ctx, x, y - 6, 1, 6, PAL.snow);
  },
  props(ctx, L, _cam, t, at) {
    const yr = L.yRoad;
    const left = at(-40);
    const right = at(66);
    const top = yr - 58;

    // arch: two posts and a banner with a checkered edge
    rect(ctx, left, top, 4, 62, PAL.ink);
    rect(ctx, right, top, 4, 62, PAL.ink);
    const bw = right - left + 4;
    rect(ctx, left, top, bw, 20, PAL.ink);
    for (let x = 0; x < bw; x += 4) {
      rect(ctx, left + x, top + 1, 2, 2, PAL.snow);
      rect(ctx, left + x + 2, top + 3, 2, 2, PAL.snow);
      rect(ctx, left + x, top + 17, 2, 2, PAL.snow);
      rect(ctx, left + x + 2, top + 15, 2, 2, PAL.snow);
    }
    rect(ctx, left + 2, top + 5, bw - 4, 10, PAL.yellow);
    const tw = textWidth('FINISH', 2);
    drawText(ctx, 'FINISH', left + Math.round((bw - tw) / 2), top + 5, PAL.ink, 2);

    // the tape: whole while he runs in, broken once he has crossed
    const ty = L.footY - 32;
    if (!runtime.atStone) {
      for (let x = 4; x < bw - 4; x++) rect(ctx, left + x, ty, 1, 1, Math.floor(x / 3) % 2 ? PAL.ember : PAL.snow);
    } else {
      const flutter = Math.floor(t / 250) % 2;
      for (let x = 4; x < at(-8) - left; x++) rect(ctx, left + x, ty + Math.floor(x / 14) + flutter, 1, 1, Math.floor(x / 3) % 2 ? PAL.ember : PAL.snow);
      for (let x = bw - 5; x > at(10) - left; x--) rect(ctx, left + x, ty + Math.floor((bw - x) / 14) + (1 - flutter), 1, 1, Math.floor(x / 3) % 2 ? PAL.ember : PAL.snow);
      rect(ctx, at(-9), ty + 3, 3, 1, PAL.ember);
      rect(ctx, at(11), ty + 4, 3, 1, PAL.snow);
    }
  },
  foreground(ctx, L, _cam, t) {
    // confetti for two seconds after he crosses (none under reduced motion, where t is 0)
    if (!runtime.finishAt || t === 0) return;
    const elapsed = t - runtime.finishAt;
    if (elapsed < 0 || elapsed > 2000) return;
    for (let i = 0; i < 70; i++) {
      const x0 = hash(i, 1) * L.W;
      const y0 = -6 - hash(i, 2) * 70;
      const vy = 0.05 + hash(i, 3) * 0.05;
      const y = y0 + elapsed * vy;
      const x = x0 + Math.sin(elapsed / 220 + i) * 4;
      if (y < 0 || y > L.H) continue;
      rect(ctx, x, y, 2, i % 3 === 0 ? 3 : 2, CONFETTI[i % CONFETTI.length]);
    }
  },
};
