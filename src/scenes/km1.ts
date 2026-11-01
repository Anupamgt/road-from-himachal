import { PAL, drawText, rect, textWidth } from '../art/pixel';
import { drawHostel, drawLamp, drawPillar } from '../art/props';
import type { Scene } from './base';

/** KM 1: IIT Patna at night: hostel windows lit behind a campus gate with its sign. */
export const km1: Scene = {
  id: 'km1',
  theme: {
    sky: [
      [0.5, PAL.night, null],
      [0.6, PAL.night, PAL.pine],
      [1, PAL.pine, null],
    ],
    stars: true,
    far: { color: PAL.pine, cap: null, amp: 0.22, f1: 0.016, f2: 0.04, seed: 4.1 },
    mid: { color: PAL.deepPine, tree: PAL.pine, amp: 0.09, f1: 0.03, f2: 0.07, seed: 6.2 },
    ground: PAL.moss,
    groundDetail: PAL.pine,
    road: PAL.ink,
    edge: PAL.stone,
    dash: PAL.yellow,
    nearTrees: { colors: [PAL.deepPine, PAL.pine], density: 0.22, minH: 22, maxH: 34 },
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  backdrop(ctx, L, _cam, _t, at) {
    // two hostel blocks, further away than the road so they drift slower
    drawHostel(ctx, at(-96, 0.7), L.yHorizon + 1, 132, 3, 2);
    drawHostel(ctx, at(120, 0.7), L.yHorizon + 1, 150, 3, 7);
  },
  props(ctx, L, _cam, _t, at) {
    const left = at(-40);
    const right = at(66);
    const h = 44;
    drawPillar(ctx, left, L.yRoad, h);
    drawPillar(ctx, right, L.yRoad, h);

    // the sign hangs between the pillars
    const bx = left + 9;
    const bw = right - left - 9;
    const by = L.yRoad - h - 3;
    rect(ctx, bx, by, bw, 19, PAL.yellow);
    rect(ctx, bx + 1, by + 1, bw - 2, 17, PAL.ink);
    const tw = textWidth('IIT PATNA', 2);
    drawText(ctx, 'IIT PATNA', bx + Math.round((bw - tw) / 2), by + 5, PAL.snow, 2);

    drawLamp(ctx, at(128), L.yRoad - 1, 34, PAL.moss);
    drawLamp(ctx, at(210), L.yRoad - 1, 34, PAL.moss);
  },
};
