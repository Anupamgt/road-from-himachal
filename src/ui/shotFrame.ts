import { shots } from '../scenes/shots';

export interface ShotFrame {
  /** Shows the picture that belongs to the stage, or nothing. */
  show(stageId: string | null): void;
}

interface Def {
  kind: 'monitor' | 'phone';
  file: string;
  alt: string;
}

const DEFS: Record<string, Def | undefined> = {
  km3: shots.minearchive
    ? { kind: 'monitor', file: 'minearchive.png', alt: 'MineArchive, the boundary archive for sand-mining sites' }
    : undefined,
  km4: shots.sitewatch
    ? { kind: 'phone', file: 'sitewatch.png', alt: 'SiteWatch, the daily progress report on a phone' }
    : undefined,
};

/**
 * Real product pictures (public/shots) shown inside a pixel monitor or phone frame over the scene.
 * Only built when the picture exists; otherwise the scene draws its own version.
 */
export function createShotFrame(host: HTMLElement): ShotFrame {
  const el = document.createElement('figure');
  el.className = 'shot';
  el.hidden = true;
  host.appendChild(el);
  let shownFor: string | null = null;

  return {
    show(stageId: string | null): void {
      const def = stageId ? DEFS[stageId] : undefined;
      if (!def || !stageId) {
        el.classList.remove('is-on');
        shownFor = null;
        return;
      }
      if (shownFor !== stageId) {
        el.className = `shot shot-${def.kind}`;
        el.innerHTML = `<div class="shot-frame"><img src="${import.meta.env.BASE_URL}shots/${def.file}" alt="${def.alt}" /></div>`;
        shownFor = stageId;
      }
      el.hidden = false;
      // let the hidden state paint first so the transition runs
      requestAnimationFrame(() => el.classList.add('is-on'));
    },
  };
}
