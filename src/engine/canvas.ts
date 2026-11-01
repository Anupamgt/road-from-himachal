// Low-resolution canvas helpers. Art is drawn small and scaled up by whole numbers only.

export interface Fit {
  /** Whole-number scale factor. */
  s: number;
  /** Buffer size in art pixels. */
  W: number;
  H: number;
}

/**
 * Buffer that covers a whole container (used by the title screen). The scale is a whole number
 * chosen from the container height, so the art stays crisp; the buffer is a little larger than
 * the container so there are never empty strips.
 */
export function coverFit(width: number, height: number): Fit {
  const s = Math.min(5, Math.max(2, Math.floor(height / 300)));
  return { s, W: Math.ceil(width / s), H: Math.ceil(height / s) };
}

/** Size a canvas to a Fit: internal buffer in art pixels, CSS size in whole-number multiples. */
export function applyFit(canvas: HTMLCanvasElement, fit: Fit): CanvasRenderingContext2D {
  canvas.width = fit.W;
  canvas.height = fit.H;
  canvas.style.width = `${fit.W * fit.s}px`;
  canvas.style.height = `${fit.H * fit.s}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}
