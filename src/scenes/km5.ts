import { drawIcon } from '../art/icons';
import { PAL, disc, drawText, rect, textWidth } from '../art/pixel';
import { runtime } from '../runtime';
import type { Scene } from './base';
import { ALL_ITEMS, itemDx } from './items';

function sign(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, colour: string): void {
  const w = textWidth(text) + 4;
  rect(ctx, x, y, w, 9, PAL.ink);
  rect(ctx, x + 1, y + 1, w - 2, 7, colour);
  drawText(ctx, text, x + 2, y + 2, PAL.ink);
  rect(ctx, x + 2, y - 4, 1, 4, PAL.stone);
  rect(ctx, x + w - 3, y - 4, 1, 4, PAL.stone);
}

function laptop(ctx: CanvasRenderingContext2D, x: number, y: number, lit: boolean): void {
  rect(ctx, x, y - 8, 11, 8, PAL.ink);
  rect(ctx, x + 1, y - 7, 9, 6, lit ? PAL.sky : PAL.night);
  if (lit) {
    rect(ctx, x + 2, y - 6, 5, 1, PAL.snow);
    rect(ctx, x + 2, y - 4, 7, 1, PAL.mist);
    rect(ctx, x + 2, y - 2, 3, 1, PAL.snow);
  }
  rect(ctx, x - 1, y, 13, 1, PAL.stone);
}

/**
 * KM 5, build season: a roadside workshop at night with lit laptops and signboards. Each project
 * floats above the road as a glowing pixel object and is collected as the runner passes it.
 */
export const km5: Scene = {
  id: 'km5',
  animated: true,
  theme: {
    sky: [[1, PAL.night, null]],
    stars: true,
    far: { color: PAL.night, cap: null, amp: 0.16, f1: 0.02, f2: 0.05, seed: 8.3 },
    mid: { color: PAL.deepPine, tree: null, amp: 0.07, f1: 0.03, f2: 0.07, seed: 3.1 },
    ground: PAL.deepPine,
    groundDetail: PAL.pine,
    road: PAL.asphalt,
    edge: PAL.stone,
    dash: PAL.stone,
    nearTrees: null,
    stone: { top: PAL.yellow, face: PAL.snow },
  },
  backdrop(ctx, _L, _cam, _t, at) {
    const mx = at(150, 0.1);
    disc(ctx, mx, 22, 7, PAL.snow);
    rect(ctx, mx - 2, 20, 2, 2, PAL.mist);
    rect(ctx, mx + 2, 24, 2, 1, PAL.mist);
  },
  midground(ctx, L, _cam, _t, at) {
    const x0 = at(-34);
    const w = 235;
    const top = L.yRoad - 50;
    // building and roof
    rect(ctx, x0, top, w, 52, PAL.ink);
    rect(ctx, x0 - 3, top - 3, w + 6, 4, PAL.stone);
    // lit interior with a long workbench
    rect(ctx, x0 + 3, top + 14, w - 6, 36, PAL.chai);
    rect(ctx, x0 + 3, top + 14, w - 6, 3, PAL.skin);
    rect(ctx, x0 + 3, L.yRoad - 14, w - 6, 3, PAL.skin);
    rect(ctx, x0 + 3, L.yRoad - 11, w - 6, 2, PAL.ink);
    for (let x = 8; x < w - 8; x += 40) rect(ctx, x0 + x, L.yRoad - 9, 2, 9, PAL.ink);
    // glowing laptops along the bench
    for (let i = 0; i < 6; i++) laptop(ctx, at(-26 + i * 38), L.yRoad - 14, true);
    // signboards hanging at the front
    sign(ctx, at(-26), top + 4, 'WRITE', PAL.yellow);
    sign(ctx, at(2), top + 4, 'DIRECT', PAL.sky);
    sign(ctx, at(34), top + 4, 'CHECK', PAL.leaf);
  },
  props(ctx, L, _cam, t, at) {
    // Floating project items. Collected ones have flown to the counter, so only the rest draw.
    for (let k = runtime.collected; k < ALL_ITEMS.length; k++) {
      const x = at(itemDx(k));
      if (x < -20 || x > L.W + 20) continue;
      const bob = Math.round(Math.sin(t / 350 + k) * 2);
      const y = Math.max(16, L.yRoad - 66) + bob;
      drawIcon(ctx, ALL_ITEMS[k].icon, x - 14, y, 2);
      // a few lit pixels around it; not a blur
      const spin = Math.floor(t / 160 + k) % 4;
      const pts: [number, number][] = [[-18, 0], [16, 4], [-14, 28], [18, 24]];
      rect(ctx, x + pts[spin][0], y + pts[spin][1], 2, 2, PAL.yellow);
      rect(ctx, x + pts[(spin + 2) % 4][0], y + pts[(spin + 2) % 4][1], 1, 1, PAL.snow);
    }
  },
};
