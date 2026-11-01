import { PAL, drawText, rect, textWidth } from '../art/pixel';
import type { Scene } from './base';

/** KM 0: snowy peaks, a pine forest and the start-line gantry. */
export const km0: Scene = {
  id: 'km0',
  theme: {
    sky: [
      [0.36, PAL.sky, null],
      [0.46, PAL.sky, PAL.mist],
      [0.76, PAL.mist, null],
      [0.84, PAL.mist, PAL.snow],
      [1, PAL.snow, null],
    ],
    stars: false,
    far: { color: PAL.stone, cap: PAL.snow, amp: 0.46, f1: 0.009, f2: 0.022, seed: 0.9 },
    mid: { color: PAL.moss, tree: PAL.pine, amp: 0.15, f1: 0.02, f2: 0.05, seed: 1.7 },
    ground: PAL.moss,
    groundDetail: PAL.leaf,
    road: PAL.asphalt,
    edge: PAL.snow,
    dash: PAL.yellow,
    nearTrees: { colors: [PAL.pine, PAL.deepPine, PAL.pine], density: 0.85, minH: 30, maxH: 48 },
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  props(ctx, L, _cam, _t, at) {
    const runnerX = at(0);

    // The start line: a checker band across the road, under the runner's feet.
    const lineX = runnerX - 3;
    for (let y = L.yRoad + 1, row = 0; y < L.H - 2; y += 2, row++) {
      for (let i = 0; i < 6; i += 2) {
        rect(ctx, lineX + i, y, 2, 2, (row + i / 2) % 2 === 0 ? PAL.snow : PAL.ink);
      }
    }

    // The gantry with a START banner above the runner.
    const left = at(-44);
    const right = at(54);
    const top = L.yRoad - 56;
    rect(ctx, left, top, 3, 58, PAL.ink);
    rect(ctx, right, top, 3, 58, PAL.ink);
    const boardW = right - left + 3;
    rect(ctx, left, top, boardW, 21, PAL.ink);
    rect(ctx, left + 2, top + 2, boardW - 4, 17, PAL.yellow);
    const tw = textWidth('START', 2);
    drawText(ctx, 'START', left + Math.round((boardW - tw) / 2), top + 5, PAL.ink, 2);
  },
};
