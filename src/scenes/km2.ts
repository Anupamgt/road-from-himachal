import { PAL, rect } from '../art/pixel';
import { drawChevronSign, drawTruck } from '../art/props';
import type { Scene } from './base';

/** Ground bend of the distant highway at world x: a gentle S-curve. */
const bend = (wx: number): number => Math.round(4 * Math.sin(wx * 0.035));

/**
 * KM 2, the turning point: the whole scene is dusk orange. A distant highway bends across the
 * land and fleet trucks pass along it with their headlights on (the one scene that moves on its own).
 */
export const km2: Scene = {
  id: 'km2',
  animated: true,
  theme: {
    sky: [
      [0.3, PAL.night, null],
      [0.38, PAL.night, PAL.ember],
      [0.54, PAL.ember, null],
      [0.62, PAL.ember, PAL.orange],
      [0.8, PAL.orange, null],
      [0.88, PAL.orange, PAL.yellow],
      [1, PAL.yellow, null],
    ],
    stars: true,
    far: { color: PAL.night, cap: null, amp: 0.28, f1: 0.012, f2: 0.03, seed: 2.4 },
    mid: { color: PAL.deepPine, tree: PAL.ink, amp: 0.1, f1: 0.025, f2: 0.06, seed: 3.3 },
    ground: PAL.pine,
    groundDetail: PAL.ember,
    road: PAL.asphalt,
    edge: PAL.orange,
    dash: PAL.yellow,
    nearTrees: { colors: [PAL.ink, PAL.deepPine], density: 0.3, minH: 24, maxH: 36 },
    stone: { top: PAL.ember, face: PAL.orange },
  },
  midground(ctx, L, cam, t) {
    const speed = 0.6;
    const base = L.yHorizon + 9;
    const off = cam * speed;

    // the bending highway
    for (let x = 0; x < L.W; x++) {
      const wx = x + off;
      const y = base + bend(wx);
      rect(ctx, x, y, 1, 6, PAL.asphalt);
      rect(ctx, x, y, 1, 1, PAL.stone);
      if (Math.floor(wx) % 12 < 6) rect(ctx, x, y + 3, 1, 1, PAL.yellow);
    }

    // trucks drive right along it; under reduced motion t is 0 and they stand still
    const span = L.W + 120;
    for (let k = 0; k < 3; k++) {
      const px = Math.round((t * 0.03 + k * (span / 3)) % span) - 60;
      const y = base + bend(px + off) + 5;
      drawTruck(ctx, px, y);
    }
  },
  props(ctx, L, _cam, _t, at) {
    drawChevronSign(ctx, at(74), L.yRoad - 1);
    drawChevronSign(ctx, at(150), L.yRoad - 1);
  },
};
