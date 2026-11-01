import { PAL, drawText, rect, textWidth } from '../art/pixel';
import type { Scene } from './base';

function building(ctx: CanvasRenderingContext2D, x: number, yBottom: number, w: number, h: number, c: string): void {
  rect(ctx, x, yBottom - h, w, h, c);
  rect(ctx, x, yBottom - h, w, 2, PAL.stone);
  for (let j = 6; j + 5 < h; j += 8) {
    for (let i = 4; i + 4 < w; i += 8) rect(ctx, x + i, yBottom - h + j, 4, 4, PAL.sky);
  }
}

/** KM 7, the refuel station: a marathon aid table under a REFUEL banner, bunting and used cups. */
export const km7: Scene = {
  id: 'km7',
  theme: {
    sky: [
      [0.4, PAL.sky, null],
      [0.5, PAL.sky, PAL.mist],
      [1, PAL.mist, null],
    ],
    stars: false,
    far: { color: PAL.stone, cap: null, amp: 0.1, f1: 0.02, f2: 0.045, seed: 1.9 },
    mid: { color: PAL.moss, tree: PAL.pine, amp: 0.06, f1: 0.03, f2: 0.07, seed: 5.5 },
    ground: PAL.mist,
    groundDetail: PAL.stone,
    road: PAL.asphalt,
    edge: PAL.snow,
    dash: PAL.snow,
    nearTrees: { colors: [PAL.leaf, PAL.moss], density: 0.28, minH: 22, maxH: 32 },
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  backdrop(ctx, L, _cam, _t, at) {
    const yb = L.yHorizon + 1;
    building(ctx, at(-90, 0.6), yb, 56, 34, PAL.snow);
    building(ctx, at(-30, 0.6), yb, 44, 46, PAL.mist);
    building(ctx, at(24, 0.6), yb, 62, 30, PAL.snow);
    building(ctx, at(96, 0.6), yb, 50, 40, PAL.mist);
    building(ctx, at(166, 0.6), yb, 60, 32, PAL.snow);
  },
  midground(ctx, L, _cam, _t, at) {
    // bunting between two poles, over the road edge
    const a = at(-14);
    const b = at(104);
    const y0 = L.yRoad - 58;
    rect(ctx, a, y0 - 2, 2, 60, PAL.ink);
    rect(ctx, b, y0 - 2, 2, 60, PAL.ink);
    const colours = [PAL.yellow, PAL.sky, PAL.leaf, PAL.ember];
    for (let x = 4, i = 0; x < b - a - 4; x += 7, i++) {
      const sag = Math.round(Math.sin(((x + 2) / (b - a)) * Math.PI) * 4);
      rect(ctx, a + x, y0 + sag, 5, 1, PAL.ink);
      rect(ctx, a + x, y0 + 1 + sag, 5, 2, colours[i % 4]);
      rect(ctx, a + x + 1, y0 + 3 + sag, 3, 2, colours[i % 4]);
      rect(ctx, a + x + 2, y0 + 5 + sag, 1, 1, colours[i % 4]);
    }
  },
  props(ctx, L, _cam, _t, at) {
    const yr = L.yRoad;

    // REFUEL banner
    const left = at(-8);
    const right = at(70);
    const top = yr - 56;
    rect(ctx, left, top, right - left, 17, PAL.ink);
    rect(ctx, left + 1, top + 1, right - left - 2, 15, PAL.yellow);
    rect(ctx, left + 2, top + 2, right - left - 4, 13, PAL.moss);
    const tw = textWidth('REFUEL', 2);
    drawText(ctx, 'REFUEL', left + Math.round((right - left - tw) / 2), top + 4, PAL.snow, 2);

    // the aid table with a white cloth, water jugs and stacked paper cups
    const tx = at(52);
    const ty = yr + 2;
    rect(ctx, tx, ty - 14, 52, 3, PAL.snow);
    rect(ctx, tx + 1, ty - 11, 50, 11, PAL.snow);
    rect(ctx, tx + 1, ty - 8, 50, 2, PAL.sky);
    rect(ctx, tx + 2, ty - 1, 3, 1, PAL.stone);
    rect(ctx, tx + 46, ty - 1, 3, 1, PAL.stone);
    for (const jx of [4, 14]) {
      rect(ctx, tx + jx, ty - 26, 8, 12, PAL.sky);
      rect(ctx, tx + jx + 1, ty - 25, 2, 8, PAL.snow);
      rect(ctx, tx + jx + 2, ty - 28, 4, 2, PAL.ink);
    }
    for (let i = 0; i < 5; i++) {
      const cx2 = tx + 26 + i * 5;
      rect(ctx, cx2, ty - 20, 4, 6, PAL.snow);
      rect(ctx, cx2, ty - 20, 4, 1, PAL.sky);
      rect(ctx, cx2, ty - 15, 4, 1, PAL.mist);
    }

    // paper cups dropped on the road behind the runner
    for (const [dx, dy] of [[-22, 14], [-36, 22], [-52, 12], [-70, 20]] as const) {
      const x = at(dx);
      const y = yr + Math.round(L.roadH * 0.3) + dy - 10;
      rect(ctx, x, y, 3, 3, PAL.snow);
      rect(ctx, x, y, 3, 1, PAL.sky);
    }
  },
};
