import { PAL, dither, drawPine, drawStone, rect, rng } from '../art/pixel';

const tri = (t: number): number => Math.abs((((t % 1) + 1) % 1) - 0.5) * 2;

/** Ridge height in pixels at column x. */
function ridge(x: number, amp: number, f1: number, f2: number, s: number): number {
  return amp * (0.62 * tri(x * f1 + s) + 0.38 * tri(x * f2 + s * 2.3));
}

/**
 * Title scene: dusk sky in flat bands, three mountain layers, a road coming toward the viewer,
 * a kilometre stone reading 0 and the start line. Returns where the runner stands.
 * Draws at any buffer size; positions are relative to W and H.
 */
export function drawTitleScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
): { cx: number; footY: number } {
  ctx.imageSmoothingEnabled = false;
  const yH = Math.round(H * 0.5);

  // --- Sky: flat bands, dithered seams, night blue down to dusk orange at the horizon.
  const bands: [number, string, string | null][] = [
    [0.34, PAL.night, null],
    [0.4, PAL.night, PAL.ember],
    [0.58, PAL.ember, null],
    [0.65, PAL.ember, PAL.orange],
    [0.86, PAL.orange, null],
    [0.92, PAL.orange, PAL.yellow],
    [1.0, PAL.yellow, null],
  ];
  let y0 = 0;
  for (const [to, a, b] of bands) {
    const y1 = Math.round(yH * to);
    if (b) dither(ctx, 0, y0, W, y1 - y0, a, b);
    else rect(ctx, 0, y0, W, y1 - y0, a);
    y0 = y1;
  }
  // stars in the night band
  const rs = rng(7);
  for (let i = 0; i < Math.round(W / 9); i++) {
    const sx = Math.floor(rs() * W);
    const sy = Math.floor(rs() * yH * 0.32);
    rect(ctx, sx, sy, 1, 1, i % 5 === 0 ? PAL.yellow : PAL.snow);
  }

  // --- Far mountains: stone with snow caps.
  const farAmp = H * 0.3;
  for (let x = 0; x < W; x++) {
    const h = Math.round(ridge(x, farAmp, 0.011, 0.027, 0.3) + H * 0.04);
    rect(ctx, x, yH - h, 1, h, PAL.stone);
    const capDepth = Math.max(0, Math.round((h - farAmp * 0.55) * 0.45));
    if (capDepth > 0) {
      rect(ctx, x, yH - h, 1, capDepth, PAL.snow);
      // jagged lower edge on the cap
      if (x % 3 === 0) rect(ctx, x, yH - h + capDepth, 1, 1, PAL.snow);
    }
  }
  // --- Mid ridge: moss hills with small pines on the crest.
  const rm = rng(21);
  const midTops: number[] = [];
  for (let x = 0; x < W; x++) {
    const h = Math.round(ridge(x, H * 0.12, 0.02, 0.05, 1.7) + H * 0.03);
    midTops.push(yH - h);
    rect(ctx, x, yH - h, 1, h + 1, PAL.moss);
  }
  for (let x = 4; x < W; x += 5 + Math.floor(rm() * 4)) {
    drawPine(ctx, x, midTops[x] + 3, 9 + Math.floor(rm() * 5), PAL.pine);
  }

  // --- Ground
  rect(ctx, 0, yH, W, H - yH, PAL.moss);
  dither(ctx, 0, yH, W, 4, PAL.leaf, PAL.moss);
  const rg = rng(5);
  for (let i = 0; i < W; i++) {
    const gy = yH + 6 + Math.floor(rg() * (H - yH - 6));
    if (rg() < 0.22) rect(ctx, Math.floor(rg() * W), gy, 2, 1, PAL.leaf);
  }

  // --- Road, coming toward the viewer.
  const roadMax = Math.round(W * 0.36);
  const centre = (t: number): number => Math.round(W * 0.52 - (1 - t) * W * 0.05);
  const halfAt = (t: number): number => Math.round(2 + (roadMax - 2) * Math.pow(t, 1.25));
  for (let y = yH; y < H; y++) {
    const t = (y - yH) / (H - yH);
    const cx = centre(t);
    const half = halfAt(t);
    rect(ctx, cx - half, y, half * 2 + 1, 1, PAL.asphalt);
    if (half >= 5) {
      rect(ctx, cx - half, y, 1, 1, PAL.snow);
      rect(ctx, cx + half, y, 1, 1, PAL.snow);
    }
    if (Math.floor(Math.pow(t, 1.9) * 16) % 2 === 0) {
      const dw = Math.max(1, Math.round(half * 0.07));
      rect(ctx, cx - Math.floor(dw / 2), y, dw, 1, PAL.yellow);
    }
  }

  // --- Near pines on both verges (drawn after the road so trunks overlap its edge).
  const rp = rng(99);
  const pine = (x: number, baseY: number, h: number, c: string): void => drawPine(ctx, x, baseY, h, c);
  for (let i = 0; i < 6; i++) {
    const t = 0.2 + rp() * 0.8;
    const by = yH + Math.round((H - yH) * t);
    const h = Math.round(14 + t * 28);
    const roadLeft = centre(t) - halfAt(t) - 6;
    const roadRight = centre(t) + halfAt(t) + 6;
    pine(Math.round(roadLeft - rp() * W * 0.12 * t - 4), by, h, i % 2 ? PAL.deepPine : PAL.pine);
    pine(Math.round(roadRight + rp() * W * 0.12 * t + 4), by, h, i % 2 ? PAL.pine : PAL.deepPine);
  }

  // --- Start line (checker) and the stone reading 0.
  const ty = 0.84;
  const sy = yH + Math.round((H - yH) * ty);
  const sh = halfAt(ty);
  const scx = centre(ty);
  for (let i = -sh; i <= sh; i += 2) {
    const dark = ((i + sh) / 2) % 2 === 0;
    rect(ctx, scx + i, sy, 2, 2, dark ? PAL.snow : PAL.ink);
    rect(ctx, scx + i, sy + 2, 2, 2, dark ? PAL.ink : PAL.snow);
  }

  const st = 0.78;
  const stoneY = yH + Math.round((H - yH) * st);
  drawStone(ctx, scx + halfAt(st) + 8, stoneY - 24, '0', { w: 16, h: 24 });

  // The runner is not part of the scene: the title screen draws him on a canvas of his own so he
  // can turn and run. He stands on the road at the start line, facing the screen.
  return { cx: scx, footY: sy + 8 };
}
