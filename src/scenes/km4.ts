import { PAL, rect } from '../art/pixel';
import { drawCone, drawCrane, drawEngineer, drawPhoneForm, drawRoller } from '../art/props';
import type { Scene } from './base';
import { shots } from './shots';

/** KM 4: a road construction site: roller, cones, a site engineer with a lit phone, cranes. */
export const km4: Scene = {
  id: 'km4',
  theme: {
    sky: [
      [0.45, PAL.sky, null],
      [0.55, PAL.sky, PAL.mist],
      [0.9, PAL.mist, null],
      [1, PAL.mist, PAL.skin],
    ],
    stars: false,
    far: { color: PAL.stone, cap: null, amp: 0.2, f1: 0.013, f2: 0.031, seed: 7.7 },
    mid: { color: PAL.chai, tree: null, amp: 0.08, f1: 0.03, f2: 0.065, seed: 2.9 },
    ground: PAL.chai,
    groundDetail: PAL.skin,
    road: PAL.ink,
    edge: PAL.yellow,
    dash: PAL.snow,
    nearTrees: null,
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  backdrop(ctx, L, _cam, _t, at) {
    const h = Math.min(52, L.yHorizon - 18);
    drawCrane(ctx, at(120, 0.5), L.yHorizon + 1, h);
    drawCrane(ctx, at(-30, 0.5), L.yHorizon + 1, Math.round(h * 0.8));
  },
  props(ctx, L, _cam, _t, at) {
    const gy = L.yRoad + 3;

    // earth mound and fresh road edge markers
    rect(ctx, at(-70), gy - 3, 26, 3, PAL.skin);
    rect(ctx, at(-66), gy - 5, 18, 2, PAL.skin);

    drawCone(ctx, at(-18), gy + 3);
    drawCone(ctx, at(22), gy + 3);

    // the engineer holds his phone toward the runner; the form it shows floats above
    const ex = at(62);
    drawEngineer(ctx, ex, gy, { phone: true });
    if (!shots.sitewatch) {
      const ui = Math.max(14, L.yRoad - 88);
      drawPhoneForm(ctx, ex - 4, ui);
      // a dotted line from the phone up to its screen
      for (let y = ui + 38; y < gy - 32; y += 2) rect(ctx, ex + 12, y, 1, 1, PAL.yellow);
    }

    drawRoller(ctx, at(98), gy + 4);
    drawCone(ctx, at(150), gy + 3);
  },
};
