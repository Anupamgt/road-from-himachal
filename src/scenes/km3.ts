import { PAL, rect } from '../art/pixel';
import { drawFlag, drawLaptopMap, drawTable } from '../art/props';
import type { Scene } from './base';
import { drawLandmark } from './landmarks';
import { shots } from './shots';

/** Reed tuft on the sand. */
function reeds(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x, y - 6, 1, 6, PAL.leaf);
  rect(ctx, x + 2, y - 8, 1, 8, PAL.moss);
  rect(ctx, x + 4, y - 5, 1, 5, PAL.leaf);
  rect(ctx, x + 1, y - 4, 1, 1, PAL.leaf);
}

/** Survey tripod with a yellow instrument on top. */
function tripod(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x, y - 12, 1, 12, PAL.ink);
  rect(ctx, x + 3, y - 12, 1, 12, PAL.ink);
  rect(ctx, x + 1, y - 8, 2, 8, PAL.chai);
  rect(ctx, x - 1, y - 17, 6, 5, PAL.yellow);
  rect(ctx, x + 1, y - 15, 2, 2, PAL.ink);
}

/** KM 3: a riverbank with sand banks, a survey flag and a field table with a laptop. */
export const km3: Scene = {
  id: 'km3',
  theme: {
    sky: [
      [0.5, PAL.sky, null],
      [0.62, PAL.sky, PAL.mist],
      [1, PAL.mist, null],
    ],
    stars: false,
    far: { color: PAL.leaf, cap: null, amp: 0.2, f1: 0.014, f2: 0.033, seed: 5.2 },
    mid: { color: PAL.moss, tree: null, amp: 0.07, f1: 0.03, f2: 0.06, seed: 1.1 },
    ground: PAL.skin,
    groundDetail: PAL.chai,
    road: PAL.chai,
    edge: PAL.skin,
    dash: PAL.chai,
    nearTrees: null,
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  backdrop(ctx, L, _cam, _t, at) {
    // the sculpted tower at the IIT Ropar gate, far off across the river
    drawLandmark(ctx, 'iit_ropar', L, at, 176, 0.8);
  },
  midground(ctx, L, cam) {
    // the river: a sky-blue ribbon with snow ripples, then a sand bank in front of it
    const top = L.yHorizon + 2;
    rect(ctx, 0, top, L.W, 12, PAL.sky);
    const off = Math.floor(cam * 0.9);
    for (let x = 0; x < L.W; x++) {
      const wx = x + off;
      if (wx % 17 === 0) rect(ctx, x, top + 3, 4, 1, PAL.snow);
      if (wx % 23 === 5) rect(ctx, x, top + 8, 3, 1, PAL.snow);
      if (wx % 29 === 11) rect(ctx, x, top + 6, 5, 1, PAL.mist);
    }
    rect(ctx, 0, top + 12, L.W, 1, PAL.mist);
  },
  props(ctx, L, _cam, _t, at) {
    const gy = L.yRoad + 2;
    drawFlag(ctx, at(-28), gy, 24, PAL.ember);
    drawTable(ctx, at(56), gy, 30);
    drawLaptopMap(ctx, at(62), gy - 12 + 1, !shots.minearchive);
    tripod(ctx, at(112), gy);
    drawFlag(ctx, at(150), gy, 22, PAL.ember);
    reeds(ctx, at(-8), L.yHorizon + 18);
    reeds(ctx, at(96), L.yHorizon + 17);
    reeds(ctx, at(190), L.yHorizon + 18);
  },
};
