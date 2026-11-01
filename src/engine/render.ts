import { applyFit, type Fit } from './canvas';
import { PAL, rect } from '../art/pixel';
import { runtime } from '../runtime';
import { STONE_GAP, drawWorld, layoutFor, placer, type Layout, type Scene } from '../scenes/base';

export interface StoneAt {
  worldX: number;
  /** null draws no stone but still anchors the scene's props. */
  label: string | null;
}

export interface RenderState {
  cam: number;
  scene: Scene;
  stone: StoneAt | null;
  /** While two scenes overlap during a run, the seam between them (screen x) and the old scene. */
  seam: { x: number; prevScene: Scene; prevStone: StoneAt | null } | null;
  /** Runner sprite frame, 0-based: 0-7 run, 8 stand, 9 catching breath. */
  frame: number;
  t: number;
}

// 4x4 ordered-dither thresholds: the dissolve between scenes is a dither, never a smooth blend.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const SEAM_HALF = 8;

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private a = document.createElement('canvas');
  private b = document.createElement('canvas');
  private actx: CanvasRenderingContext2D;
  private bctx: CanvasRenderingContext2D;
  private sheet: HTMLImageElement | null = null;
  private band: ImageData | null = null; // reused every frame of a dissolve
  fit: Fit = { s: 3, W: 1, H: 1 };
  layout: Layout = layoutFor(1, 1);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.actx = this.a.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    this.bctx = this.b.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  }

  setSheet(img: HTMLImageElement): void {
    this.sheet = img;
  }

  resize(fit: Fit): void {
    this.fit = fit;
    this.ctx = applyFit(this.canvas, fit);
    for (const c of [this.a, this.b]) {
      c.width = fit.W;
      c.height = fit.H;
    }
    this.actx.imageSmoothingEnabled = false;
    this.bctx.imageSmoothingEnabled = false;
    this.layout = layoutFor(fit.W, fit.H);
  }

  render(st: RenderState): void {
    const { ctx, layout: L } = this;
    const { W, H } = this.fit;
    if (st.seam) {
      const { x, prevScene, prevStone } = st.seam;
      const x0 = Math.max(0, Math.min(W, x - SEAM_HALF));
      const x1 = Math.max(0, Math.min(W, x + SEAM_HALF));
      if (x1 <= 0) {
        drawWorld(ctx, L, st.cam, st.scene, st.stone, st.t);
      } else if (x0 >= W) {
        drawWorld(ctx, L, st.cam, prevScene, prevStone, st.t);
      } else {
        drawWorld(this.actx, L, st.cam, prevScene, prevStone, st.t);
        drawWorld(this.bctx, L, st.cam, st.scene, st.stone, st.t);
        if (x0 > 0) ctx.drawImage(this.a, 0, 0, x0, H, 0, 0, x0, H);
        if (x1 < W) ctx.drawImage(this.b, x1, 0, W - x1, H, x1, 0, W - x1, H);
        if (x1 > x0) {
          const da = this.actx.getImageData(x0, 0, x1 - x0, H);
          const db = this.bctx.getImageData(x0, 0, x1 - x0, H);
          if (!this.band || this.band.width !== x1 - x0 || this.band.height !== H) {
            this.band = ctx.createImageData(x1 - x0, H);
          }
          const out = this.band;
          const bandStart = x - SEAM_HALF;
          for (let j = 0; j < H; j++) {
            for (let i = 0; i < x1 - x0; i++) {
              const gx = x0 + i;
              const t = (gx - bandStart) / (SEAM_HALF * 2);
              const useNew = t > BAYER[(j & 3) * 4 + (gx & 3)];
              const k = (j * (x1 - x0) + i) * 4;
              const src = useNew ? db.data : da.data;
              out.data[k] = src[k];
              out.data[k + 1] = src[k + 1];
              out.data[k + 2] = src[k + 2];
              out.data[k + 3] = 255;
            }
          }
          ctx.putImageData(out, x0, 0);
        }
      }
    } else {
      drawWorld(ctx, L, st.cam, st.scene, st.stone, st.t);
    }

    if (this.sheet && this.sheet.complete) {
      ctx.drawImage(this.sheet, st.frame * 64, 0, 64, 64, L.runnerCx - 32, L.footY - 61, 64, 64);
    }

    // Small things the runner carries or does, drawn on the sprite.
    const cx = L.runnerCx;
    if (runtime.cup) {
      rect(ctx, cx + 9, L.footY - 36, 4, 5, PAL.snow);
      rect(ctx, cx + 9, L.footY - 36, 4, 1, PAL.sky);
      rect(ctx, cx + 9, L.footY - 32, 4, 1, PAL.mist);
    }
    if (runtime.armsUp) {
      rect(ctx, cx - 8, L.footY - 58, 3, 3, PAL.skin);
      rect(ctx, cx - 7, L.footY - 55, 2, 18, PAL.skin);
      rect(ctx, cx + 5, L.footY - 60, 3, 3, PAL.skin);
      rect(ctx, cx + 5, L.footY - 57, 2, 20, PAL.skin);
    }

    // Foreground of the scene on the runner's side of the seam.
    const useNext = !st.seam || st.seam.x <= cx;
    const fgScene = useNext ? st.scene : st.seam!.prevScene;
    const fgStone = useNext ? st.stone : st.seam!.prevStone;
    if (fgScene.foreground) {
      fgScene.foreground(ctx, L, st.cam, st.t, placer(L, st.cam, fgStone?.worldX ?? st.cam + cx + STONE_GAP));
    }
  }
}
