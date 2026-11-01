import { site, title } from '../content';
import { applyFit, coverFit, loadImage } from '../engine/canvas';
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
  const art = el.querySelector('.title-art') as HTMLElement;
  const buttons = [...el.querySelectorAll<HTMLButtonElement>('.px-btn')];
  let sheet: HTMLImageElement | null = null;
  let visible = true;

  // --- Scene: redraw when the container size changes.
  const redraw = (): void => {
    const w = art.clientWidth || window.innerWidth;
    const h = art.clientHeight || window.innerHeight;
    const fit = coverFit(w, h);
    const ctx = applyFit(canvas, fit);
    drawTitleScene(ctx, fit.W, fit.H, sheet);
  };
  redraw();
  loadImage(`${import.meta.env.BASE_URL}sprites/runner_sheet_1x.png`)
    .then((img) => {
      sheet = img;
      redraw();
    })
    .catch(() => {
      /* the scene still draws without the runner */
    });
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
    b.addEventListener('click', () => onChoose(b.dataset.choice as Choice));
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
      onChoose(buttons[selected].dataset.choice as Choice);
    }
  });

  return {
    setVisible(v: boolean): void {
      if (v === visible) return;
      visible = v;
      el.classList.toggle('is-away', !v);
      if (v) redraw();
    },
    isVisible: () => visible,
  };
}
