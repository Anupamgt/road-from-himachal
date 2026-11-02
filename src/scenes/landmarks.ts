// Landmark pictures: the photos in art-src/ turned into palette pixel art (scripts/make-landmarks.py).
// Each comes in a large size for laptop windows and a small one for short windows (phones).

type Name = 'iit_patna' | 'iit_ropar';

const cache = new Map<string, HTMLImageElement>();

function load(key: string): HTMLImageElement {
  let img = cache.get(key);
  if (!img) {
    img = new Image();
    // The scene is drawn without it until it arrives; the game redraws when it does.
    img.onload = () => window.dispatchEvent(new Event('landmark-loaded'));
    img.src = `${import.meta.env.BASE_URL}landmarks/${key}.png`;
    cache.set(key, img);
  }
  return img;
}

/** The landmark picture if it has loaded, else null. `yHorizon` picks the size that fits the sky. */
export function landmark(name: Name, yHorizon: number): HTMLImageElement | null {
  const img = load(`${name}_${yHorizon >= 96 ? 'l' : 's'}`);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/** Starts every download up front so the pictures are there when the runner arrives. */
export function preloadLandmarks(): void {
  for (const name of ['iit_patna', 'iit_ropar']) for (const size of ['l', 's']) load(`${name}_${size}`);
}

/**
 * Draws a landmark standing on the horizon: its foot is hidden behind the ground, which the scene
 * fills afterwards. `dx` is where its left edge sits relative to the runner on a wide window; it is
 * pulled left on narrow windows so it stays in view.
 */
export function drawLandmark(
  ctx: CanvasRenderingContext2D,
  name: Name,
  L: { yHorizon: number; W: number; runnerCx: number },
  at: (dx: number, speed?: number) => number,
  dx: number,
  speed: number,
): void {
  const img = landmark(name, L.yHorizon);
  if (!img) return;
  const room = L.W - L.runnerCx - Math.round(img.naturalWidth * 0.6);
  ctx.drawImage(img, at(Math.min(dx, Math.max(24, room)), speed), L.yHorizon + 3 - img.naturalHeight);
}
