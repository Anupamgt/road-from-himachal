import { stages } from './content';
import { loadImage, type Fit } from './engine/canvas';
import { onReducedMotionChange, prefersReducedMotion } from './engine/prefs';
import { Renderer, type RenderState, type StoneAt } from './engine/render';
import { STAND_FRAME } from './engine/sprite';
import { buildTimeline, jumpTo, whereIs, type Segment, type Timeline, type Where } from './engine/timeline';
import { runtime } from './runtime';
import { STONE_GAP } from './scenes/base';
import { getScene } from './scenes';
import { ALL_ITEMS, itemDx } from './scenes/items';
import { createBanner } from './ui/banner';
import { createChai } from './ui/chai';
import { createDialogue } from './ui/dialogue';
import { createFinishUi } from './ui/finishUi';
import { createFlights } from './ui/flights';
import { createHud } from './ui/hud';
import { createInventory } from './ui/inventory';
import { preloadLandmarks } from './scenes/landmarks';
import { createShotFrame } from './ui/shotFrame';
import { createStageMap } from './ui/stageMap';
import { createStatus } from './ui/status';
import { createTitleScreen, type Choice } from './ui/titleScreen';

const STRIDE = 5; // art pixels of travel per running frame
const GLIDE_MS = 85; // the runner eases toward the scroll position with this time constant
const MOVING_PX = 6; // closer than this to the scroll position counts as stopped
const KM5 = stages.findIndex((s) => s.id === 'km5');
const KM7 = stages.findIndex((s) => s.id === 'km7');
const FINISH = stages.findIndex((s) => s.id === 'finish');

interface StageUi {
  enter(): void;
  leave(): void;
}

/**
 * Game layer: pinned window with parallax scenes, a runner tied to scroll position, checkpoints,
 * HUD, dialogue box and stage map. Everything is derived from scrollY, so the runner stops the
 * instant scrolling stops and runs backwards when scrolling up.
 */
export function startGame(host: HTMLElement): void {
  host.innerHTML = `
    <div class="scroller" id="scroller">
      <div class="stage" id="stage">
        <p class="stage-brand">The Road from Himachal</p>
        <div class="gamewin pixel-box">
          <div class="gamewin-inner pixel-box" id="gamewin"><canvas aria-hidden="true"></canvas></div>
        </div>
      </div>
    </div>`;
  const scroller = host.querySelector('#scroller') as HTMLElement;
  const stageEl = host.querySelector('#stage') as HTMLElement;
  const win = host.querySelector('#gamewin') as HTMLElement;
  const canvas = win.querySelector('canvas') as HTMLCanvasElement;

  const renderer = new Renderer(canvas);
  const hud = createHud(win);
  const banner = createBanner(win);
  const shotUi = createShotFrame(win);
  const flights = createFlights(win, () => hud.counter());
  const jump = (id: string): void => {
    jumpTo(tl, id);
    update();
  };
  const map = createStageMap(stageEl, jump);
  const dialogue = createDialogue(stageEl);

  let tl: Timeline = buildTimeline(window.innerHeight);
  scroller.style.height = `${tl.scrollerHeight}px`;

  const title = createTitleScreen(host, (choice: Choice) => {
    // Jumps are instant: no running animation.
    title.setVisible(false);
    jump(choice === 'quick' ? 'km7' : 'km0');
  });

  // ---------- Per-stage screens ----------
  let dirty = true;
  const markDirty = (): void => {
    dirty = true;
  };
  const inventory = createInventory(win, (item) => dialogue.openItem(item));
  dialogue.onBack(() => {
    dialogue.open(stages[KM5]);
    inventory.clearSelection();
  });
  const chai = createChai(win, dialogue, markDirty);
  const statusScreen = createStatus(win, jump);
  const finishUi = createFinishUi(win, dialogue, () => {
    runtime.finishAt = 0;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    update();
  });
  const stageUi: Record<string, StageUi | undefined> = {
    km5: inventory,
    km6: chai,
    km7: statusScreen,
    finish: finishUi,
  };

  // ---------- Rendering ----------
  // The camera does not jump with each wheel notch: it eases toward the scroll position, so the
  // run is smooth and he settles into his stop. `shown` is the travel (scroll px) on screen.
  let shown = 0;
  let restSince: number | null = null;
  let lastRestKey = -1;
  let lastTick = 0;

  const targetTravel = (): number => whereIs(tl, window.scrollY).travel;
  const isMoving = (): boolean => !prefersReducedMotion() && Math.abs(targetTravel() - shown) > MOVING_PX;

  /** Moves `shown` toward the scroll position. Returns true while it is still on its way. */
  function glide(now: number): boolean {
    const target = targetTravel();
    const diff = target - shown;
    if (lastTick === 0 || prefersReducedMotion() || Math.abs(diff) > window.innerHeight * 1.5) {
      shown = target; // a jump from the stage map or a resize: no glide
      return false;
    }
    if (Math.abs(diff) < 0.25) {
      shown = target;
      return false;
    }
    const dt = Math.min(64, Math.max(0, now - lastTick));
    shown += diff * (1 - Math.exp(-dt / GLIDE_MS));
    return true;
  }

  /** Milliseconds since he settled at a stone, or null while he runs or motion is reduced. */
  function restMsNow(): number | null {
    const w = whereIs(tl, window.scrollY);
    if (prefersReducedMotion() || w.phase !== 'hold' || isMoving()) {
      restSince = null;
      return null;
    }
    if (restSince === null) restSince = performance.now();
    return performance.now() - restSince;
  }

  const stoneFor = (seg: Segment, s: number): StoneAt | null => {
    const stage = stages[seg.index];
    const camAtHold = Math.floor((seg.travelStart + seg.runLen) / s);
    return { worldX: camAtHold + renderer.layout.runnerCx + STONE_GAP, label: stage.km === null ? null : String(stage.km) };
  };

  /** How many KM 5 items the runner has passed. */
  function collectedAt(w: Where, cam: number, s: number, reduced: boolean): number {
    const idx = w.segment.index;
    if (idx > KM5) return ALL_ITEMS.length;
    if (idx < KM5) return 0;
    if (reduced) return w.phase === 'hold' ? ALL_ITEMS.length : 0;
    const seg = tl.segments[KM5];
    const camHold = Math.floor((seg.travelStart + seg.runLen) / s);
    let n = 0;
    for (let k = 0; k < ALL_ITEMS.length; k++) if (cam >= camHold + itemDx(k)) n++;
    return n;
  }

  function syncRuntime(w: Where, cam: number): void {
    const idx = w.segment.index;
    runtime.atStone = w.phase === 'hold';
    runtime.cup = idx > KM7 || (idx === KM7 && w.phase === 'hold');
    runtime.armsUp = idx === FINISH && w.phase === 'hold';
    runtime.collected = collectedAt(w, cam, renderer.fit.s, prefersReducedMotion());
  }

  function stateNow(): RenderState {
    const w = whereIs(tl, window.scrollY);
    const { s, W } = renderer.fit;
    const seg = w.segment;
    const reduced = prefersReducedMotion();
    const scene = getScene(stages[seg.index].scene);
    const camHold = Math.floor((seg.travelStart + seg.runLen) / s);
    // Reduced motion: scenes are stills; the camera rests at the stone.
    const cam = reduced ? camHold : Math.floor(shown / s);
    const stone = stoneFor(seg, s);
    syncRuntime(w, cam);

    let seam: RenderState['seam'] = null;
    if (!reduced && w.phase === 'run' && seg.index > 0) {
      const camStart = Math.floor(seg.travelStart / s);
      const runBuf = seg.runLen / s;
      const seamWorld = camStart + Math.min(W * 0.9, runBuf * 0.6);
      const prevSeg = tl.segments[seg.index - 1];
      seam = {
        x: Math.round(seamWorld - cam),
        prevScene: getScene(stages[prevSeg.index].scene),
        prevStone: stoneFor(prevSeg, s),
      };
    }

    // Running while the camera is on the move; standing once it stops mid-road; at a stone he
    // arrives out of breath (see the renderer), then straightens up.
    const restMs = restMsNow();
    let frame = STAND_FRAME;
    if (!reduced && isMoving()) frame = (((Math.floor(cam / STRIDE) % 8) + 8) % 8);
    return { cam, scene, stone, seam, frame, restMs, t: reduced ? 0 : performance.now() };
  }

  // True while the scene in view moves on its own (trucks, steam, confetti), so it keeps redrawing.
  function sceneAnimating(): boolean {
    if (prefersReducedMotion()) return false;
    const w = whereIs(tl, window.scrollY);
    const here = getScene(stages[w.segment.index].scene).animated;
    const before = w.phase === 'run' && w.segment.index > 0 && getScene(stages[w.segment.index - 1].scene).animated;
    return Boolean(here || before);
  }

  // Scenes that move on their own redraw at about 30 fps: smooth enough, kinder to phones.
  let lastAnimDraw = 0;
  function frameLoop(now: number): void {
    if (glide(now)) dirty = true;
    lastTick = now;
    const rest = restMsNow();
    if (rest !== null) {
      const key = rest < 3200 ? Math.floor(rest / 45) : 1000 + Math.floor(rest / 500);
      if (key !== lastRestKey) {
        lastRestKey = key;
        dirty = true;
      }
    }
    if (!title.isVisible() && now - lastAnimDraw >= 33 && sceneAnimating()) {
      dirty = true;
      lastAnimDraw = now;
    }
    if (dirty && !title.isVisible()) {
      dirty = false;
      const st = stateNow();
      renderer.render(st);
      // read by tests and handy when debugging in the browser
      stageEl.dataset.frame = String(st.frame);
      stageEl.dataset.cam = String(st.cam);
    } else if (dirty) {
      dirty = false; // title is covering the window; the next change after it hides will redraw
    }
    requestAnimationFrame(frameLoop);
  }

  // ---------- Item counter and flights ----------
  let lastCollected = 0;
  let hudCount = 0;

  function updateItems(w: Where): void {
    const { s } = renderer.fit;
    const reduced = prefersReducedMotion();
    const cam = reduced ? 0 : Math.floor(w.travel / s);
    const c = collectedAt(w, cam, s, reduced);
    if (c === lastCollected) return;
    const gained = c - lastCollected;
    if (gained > 0 && gained <= 2 && w.phase === 'run' && !reduced) {
      const size = 28 * s;
      const fromX = renderer.layout.runnerCx * s - size / 2;
      const fromY = Math.max(16, renderer.layout.yRoad - 66) * s;
      for (let k = lastCollected; k < c; k++) {
        flights.fly(ALL_ITEMS[k].icon, fromX, fromY, size, (k - lastCollected) * 90, () => {
          hudCount = Math.max(hudCount, k + 1);
          hud.setItems(hudCount);
          hud.pop();
        });
      }
    } else {
      hudCount = c;
      hud.setItems(c);
    }
    lastCollected = c;
  }

  // ---------- Checkpoints ----------
  let openId: string | null = null;

  function updateCheckpoint(): void {
    const w = whereIs(tl, window.scrollY);
    const titleUp = title.isVisible();
    const want = !titleUp && w.phase === 'hold' ? w.segment.id : null;
    if (want !== openId) {
      if (openId) {
        stageUi[openId]?.leave();
        if (openId === 'finish') runtime.finishAt = 0;
      }
      openId = want;
      if (want) {
        const stage = stages[w.segment.index];
        if (want === 'finish') {
          dialogue.close(); // the Continue screen opens it once "Stage clear" has shown
          runtime.finishAt = performance.now();
        } else if (stage.text) {
          dialogue.open(stage);
        } else {
          dialogue.close();
        }
        if (stage.text || want === 'finish') dialogue.setHint(null);
        else dialogue.setHint('Keep scrolling', `Next: ${stages[w.segment.index + 1].mapLabel}`);
        if (stage.banner) banner.show(stage.banner, stage.id === 'km2');
        else banner.hide();
        shotUi.show(stage.id);
        stageUi[want]?.enter();
      } else {
        dialogue.close();
        banner.hide();
        shotUi.show(null);
      }
    }
    if (!want && !titleUp) {
      const nextStage = stages[w.segment.index];
      if (w.phase === 'run') dialogue.setHint('Keep scrolling', `Next: ${nextStage.mapLabel}`);
      else dialogue.setHint(null);
    }
  }

  function update(): void {
    title.setVisible(window.scrollY < 1);
    const w = whereIs(tl, window.scrollY);
    const idx = w.segment.index;
    const stage = stages[idx];
    const shown = w.phase === 'run' && idx > 0 ? stages[idx - 1] : stage;
    hud.setKm(shown.km === null ? 'FINISH' : `KM ${shown.km}`);
    hud.setProgress(window.scrollY / tl.total);
    map.setCurrent(w.phase === 'hold' ? idx : idx - 1);
    updateItems(w);
    updateCheckpoint();
    markDirty();
  }

  function onScroll(): void {
    update();
  }

  // ---------- Size ----------
  const resize = (): void => {
    const w = win.clientWidth;
    const h = win.clientHeight;
    if (w === 0 || h === 0) return;
    const s = h >= 560 ? 4 : 3;
    const fit: Fit = { s, W: Math.ceil(w / s), H: Math.ceil(h / s) };
    renderer.resize(fit);
    chai.place(renderer.layout, s);
    tl = buildTimeline(window.innerHeight);
    scroller.style.height = `${tl.scrollerHeight}px`;
    update();
  };
  new ResizeObserver(resize).observe(win);
  window.addEventListener('resize', resize);
  onReducedMotionChange(update);

  loadImage(`${import.meta.env.BASE_URL}sprites/runner_sheet_1x.png`)
    .then((img) => {
      renderer.setSheet(img);
      markDirty();
    })
    .catch(() => {
      /* the scene still renders without the runner */
    });

  preloadLandmarks();
  window.addEventListener('landmark-loaded', markDirty);
  window.addEventListener('scroll', onScroll, { passive: true });
  resize();
  requestAnimationFrame(frameLoop);
}
