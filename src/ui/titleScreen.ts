import { site, title } from '../content';
import { applyFit, coverFit, loadImage } from '../engine/canvas';
import { prefersReducedMotion } from '../engine/prefs';
import { drawTitleScene } from '../scenes/title';

export type Choice = 'quick' | 'full';

export interface TitleScreen {
  setVisible(visible: boolean): void;
  isVisible(): boolean;
}

const ARROW =
  '<svg class="arrow" viewBox="0 0 8 10" width="16" height="20" aria-hidden="true" focusable="false" shape-rendering="crispEdges">' +
  '<path d="M0 0h2v2h2v2h2v2H4v2H2v2H0z" fill="#f2c230"/></svg>';

export function createTitleScreen(host: HTMLElement, onChoose: (choice: Choice) => void): TitleScreen {
  const el = document.createElement('section');
  el.className = 'title';
  el.setAttribute('aria-labelledby', 'title-h1');
  el.innerHTML = `
    <div class="title-art" aria-hidden="true"><canvas></canvas></div>
    <div class="title-ui">
      <h1 id="title-h1">${site.name}</h1>
      <p class="title-tagline pixel-box">${site.tagline}</p>
      <div class="title-choices" role="group" aria-label="Choose how to play">
        <button type="button" class="px-btn" data-choice="quick">${ARROW}<span>${title.quickRun}</span></button>
        <button type="button" class="px-btn" data-choice="full">${ARROW}<span>${title.fullRun}</span></button>
      </div>
      <p class="title-kana" lang="ja">${site.katakana}</p>
    </div>`;
  host.appendChild(el);

  const canvas = el.querySelector('canvas') as HTMLCanvasElement;
  // He has a canvas of his own, stacked over the scene, so he can sink away and run.
  const runnerCanvas = document.createElement('canvas');
  runnerCanvas.className = 'title-runner';
  canvas.after(runnerCanvas);
  const art = el.querySelector('.title-art') as HTMLElement;
  const ui = el.querySelector('.title-ui') as HTMLElement;
  const buttons = [...el.querySelectorAll<HTMLButtonElement>('.px-btn')];
  let sheet: HTMLImageElement | null = null;
  let bust: HTMLImageElement | null = null;
  let visible = true;
  let leaving = false;
  let spot = { cx: 0, footY: 0 };
  let rctx: CanvasRenderingContext2D | null = null;
  let artW = 0;
  let artH = 0;

  const ready = (img: HTMLImageElement | null): img is HTMLImageElement =>
    Boolean(rctx && img && img.complete && img.naturalWidth > 0);

  /** The portrait faces the screen from the bottom edge of the title, `dy` art pixels down. */
  const drawBust = (dy = 0): void => {
    if (!rctx || !ready(bust)) return;
    rctx.clearRect(0, 0, runnerCanvas.width, runnerCanvas.height);
    const size = bust.naturalWidth;
    rctx.drawImage(bust, Math.round(artW * 0.52 - size / 2), Math.round(artH - size + dy));
  };
  /** One 64x64 frame of the runner, standing on `spot` (feet on the road), `dx` art pixels right. */
  const drawRunner = (frame: number, dx = 0): void => {
    if (!rctx || !ready(sheet)) return;
    rctx.clearRect(0, 0, runnerCanvas.width, runnerCanvas.height);
    rctx.drawImage(sheet, frame * 64, 0, 64, 64, Math.round(spot.cx + dx - 32), spot.footY - 61, 64, 64);
  };
  /** At rest he faces the screen; without the portrait he stands side-on on the start line. */
  const drawRest = (): void => (bust ? drawBust() : drawRunner(8));

  // --- Scene: redraw when the container size changes.
  const redraw = (): void => {
    const w = art.clientWidth || window.innerWidth;
    const h = art.clientHeight || window.innerHeight;
    const fit = coverFit(w, h);
    const ctx = applyFit(canvas, fit);
    spot = drawTitleScene(ctx, fit.W, fit.H);
    rctx = applyFit(runnerCanvas, fit);
    artW = fit.W;
    artH = fit.H;
    if (!leaving) drawRest();
  };
  redraw();
  const imageBase = `${import.meta.env.BASE_URL}sprites/`;
  for (const [name, set] of [
    ['runner_sheet_1x.png', (img: HTMLImageElement) => (sheet = img)],
    ['portrait_128.png', (img: HTMLImageElement) => (bust = img)],
  ] as const) {
    loadImage(imageBase + name)
      .then((img) => {
        set(img);
        redraw();
      })
      .catch(() => {
        /* the scene still draws without him */
      });
  }

  /**
   * The portrait sinks out of the bottom edge, he is standing on the start line, then he breaks
   * into a run toward the right, the direction the road goes. `onMidway` starts the game partway
   * through the run, so the title's fade-out reveals it already in place.
   */
  const SINK_MS = 220;
  const STAND_MS = 140;
  const RUN_MS = 700;
  const CADENCE_MS = 55;
  const playLeave = (onMidway: () => void): void => {
    const start = performance.now();
    const run = Math.max(80, artW - spot.cx + 48);
    const runAt = (bust ? SINK_MS : 0) + STAND_MS;
    let called = false;
    const tick = (now: number): void => {
      if (!leaving) return; // the title came back before he finished
      const t = now - start;
      if (bust && t < SINK_MS) {
        const u = t / SINK_MS;
        drawBust(artH * 0.5 * u * u);
      } else if (t < runAt) {
        drawRunner(8);
      } else {
        const u = Math.min(1, (t - runAt) / RUN_MS);
        drawRunner(Math.floor((t - runAt) / CADENCE_MS) % 8, run * Math.pow(u, 1.6));
      }
      if (!called && t >= runAt + RUN_MS * 0.6) {
        called = true;
        onMidway();
      }
      if (t < runAt + RUN_MS) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const choose = (choice: Choice): void => {
    if (leaving) return;
    if (prefersReducedMotion() || !sheet) {
      onChoose(choice);
      return;
    }
    leaving = true;
    ui.classList.add('is-leaving');
    playLeave(() => onChoose(choice));
  };
  let raf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(redraw);
  }).observe(art);

  // --- Selection: the arrow marks the selected choice. Full run is the default.
  let selected = 1;
  const select = (i: number): void => {
    selected = i;
    buttons.forEach((b, j) => b.classList.toggle('is-selected', j === i));
  };
  select(1);
  buttons.forEach((b, i) => {
    b.addEventListener('pointerenter', () => select(i));
    b.addEventListener('focus', () => select(i));
    b.addEventListener('click', () => choose(b.dataset.choice as Choice));
  });

  document.addEventListener('keydown', (e) => {
    if (!visible || e.metaKey || e.ctrlKey || e.altKey) return;
    const active = document.activeElement;
    const onButton = active instanceof HTMLButtonElement && el.contains(active);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      select(0);
      if (onButton) buttons[0].focus();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      select(1);
      if (onButton) buttons[1].focus();
    } else if (e.key === 'Enter' && (active === document.body || active === null)) {
      e.preventDefault();
      choose(buttons[selected].dataset.choice as Choice);
    }
  });

  return {
    setVisible(v: boolean): void {
      if (v === visible) return;
      visible = v;
      el.classList.toggle('is-away', !v);
      if (v) {
        leaving = false;
        ui.classList.remove('is-leaving');
        redraw();
      }
    },
    isVisible: () => visible,
  };
}
