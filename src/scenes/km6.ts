import { PAL, drawText, rect } from '../art/pixel';
import { chai } from '../content';
import { runtime } from '../runtime';
import type { Scene } from './base';

const GLOW = [PAL.yellow, PAL.sky, PAL.ember, PAL.leaf];

/** Three steam puffs; the frame changes slowly. */
function steam(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  const sets: [number, number][][] = [
    [[0, 0], [2, -4], [0, -8]],
    [[1, -1], [-1, -5], [1, -9]],
    [[2, 0], [0, -4], [-1, -8]],
  ];
  for (const [dx, dy] of sets[frame % 3]) {
    rect(ctx, x + dx, y + dy, 2, 2, PAL.mist);
    rect(ctx, x + dx + 1, y + dy - 1, 1, 1, PAL.snow);
  }
}

function glass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x, y, 4, 6, PAL.snow);
  rect(ctx, x + 1, y + 2, 2, 3, PAL.chai);
  rect(ctx, x, y, 4, 1, PAL.mist);
}

/**
 * KM 6, the chai tapri at dusk: tin roof, a hand-painted CHAI board, a chalkboard with my lifts,
 * a kettle (with slow steam) on the counter, a string of lights, and a bench for the runner.
 */
export const km6: Scene = {
  id: 'km6',
  animated: true,
  theme: {
    sky: [
      [0.34, PAL.night, null],
      [0.44, PAL.night, PAL.sky],
      [0.7, PAL.sky, null],
      [0.78, PAL.sky, PAL.mist],
      [1, PAL.mist, null],
    ],
    stars: true,
    far: { color: PAL.night, cap: null, amp: 0.22, f1: 0.014, f2: 0.034, seed: 9.9 },
    mid: { color: PAL.pine, tree: PAL.deepPine, amp: 0.1, f1: 0.026, f2: 0.06, seed: 4.4 },
    ground: PAL.chai,
    groundDetail: PAL.skin,
    road: PAL.asphalt,
    edge: PAL.stone,
    dash: PAL.yellow,
    nearTrees: { colors: [PAL.deepPine, PAL.pine], density: 0.22, minH: 20, maxH: 30 },
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  midground(ctx, L, _cam, t, at) {
    const yr = L.yRoad;
    const x0 = at(-26);
    const w = 126;

    // wall: dark planks
    rect(ctx, x0, yr - 49, w, 50, PAL.chai);
    for (let x = 6; x < w; x += 14) rect(ctx, x0 + x, yr - 49, 1, 50, PAL.ink);
    // posts
    rect(ctx, x0 - 2, yr - 54, 3, 56, PAL.ink);
    rect(ctx, x0 + w - 1, yr - 54, 3, 56, PAL.ink);
    // tin roof, corrugated
    rect(ctx, x0 - 6, yr - 58, w + 12, 3, PAL.stone);
    rect(ctx, x0 - 4, yr - 55, w + 8, 2, PAL.asphalt);
    for (let x = x0 - 6; x < x0 + w + 6; x += 4) rect(ctx, x, yr - 58, 1, 3, PAL.mist);

    // the hand-painted CHAI board, each letter its own colour
    rect(ctx, x0 + 2, yr - 50, 34, 15, PAL.ink);
    rect(ctx, x0 + 3, yr - 49, 32, 13, PAL.snow);
    ['C', 'H', 'A', 'I'].forEach((ch, i) => drawText(ctx, ch, x0 + 5 + i * 8, yr - 46, GLOW[i], 2));

    // the chalkboard, in pixel chalk
    const cx = at(14);
    rect(ctx, cx - 1, yr - 49, 67, 22, PAL.chai);
    rect(ctx, cx, yr - 48, 65, 20, PAL.ink);
    chai.chalkboard.forEach((line, i) => drawText(ctx, line, cx + 1, yr - 46 + i * 6, PAL.mist));

    // string of lights under the roof
    for (let x = 0; x <= w; x += 6) {
      const sag = Math.round(Math.sin((x / w) * Math.PI) * 3);
      rect(ctx, x0 + x, yr - 52 + sag, 1, 1, PAL.stone);
      rect(ctx, x0 + x, yr - 51 + sag, 2, 2, GLOW[(x / 6) % 4 | 0]);
    }

    // counter with the kettle on a stove
    const kx = at(62);
    rect(ctx, at(50), yr - 12, 50, 13, PAL.chai);
    rect(ctx, at(50), yr - 12, 50, 2, PAL.skin);
    rect(ctx, kx - 2, yr - 14, 14, 2, PAL.ink);
    rect(ctx, kx, yr - 16, 3, 2, PAL.ember);
    rect(ctx, kx + 6, yr - 16, 3, 2, PAL.yellow);
    // kettle: body, lid, spout and handle
    rect(ctx, kx, yr - 26, 10, 10, PAL.mist);
    rect(ctx, kx + 7, yr - 26, 3, 10, PAL.stone);
    rect(ctx, kx + 2, yr - 28, 6, 2, PAL.stone);
    rect(ctx, kx + 4, yr - 30, 2, 2, PAL.ink);
    rect(ctx, kx + 10, yr - 24, 3, 1, PAL.mist);
    rect(ctx, kx - 3, yr - 25, 3, 1, PAL.ink);
    rect(ctx, kx - 3, yr - 24, 1, 5, PAL.ink);
    steam(ctx, kx + 12, yr - 28, Math.floor(t / 450));
    if (runtime.glasses >= 2) glass(ctx, at(82), yr - 18);
  },
  props(ctx, L, _cam, _t, at) {
    // the bench behind the runner
    const bx = at(-22);
    rect(ctx, bx, L.footY - 22, 44, 3, PAL.skin);
    rect(ctx, bx + 2, L.footY - 19, 3, 19, PAL.chai);
    rect(ctx, bx + 39, L.footY - 19, 3, 19, PAL.chai);
  },
  foreground(ctx, L, _cam, _t, at) {
    if (!runtime.atStone) return;
    // when he has stopped, the bench front covers his legs so he reads as sitting, glass in hand
    const bx = at(-22);
    rect(ctx, bx, L.footY - 20, 44, 18, PAL.chai);
    rect(ctx, bx, L.footY - 20, 44, 2, PAL.skin);
    rect(ctx, bx, L.footY - 2, 44, 2, PAL.ink);
    glass(ctx, at(10), L.footY - 38);
  },
};
