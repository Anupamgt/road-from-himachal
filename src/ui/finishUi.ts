import { finish } from '../content';
import { prefersReducedMotion } from '../engine/prefs';
import type { Dialogue } from './dialogue';

export interface FinishUi {
  enter(): void;
  leave(): void;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LOCK_EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

/**
 * The finish: "Stage clear" for a second, then the Continue screen. The countdown from 9 runs only
 * while nobody interacts and stops for good at the first movement, touch or key. If it reaches 0
 * the credits roll; they can be skipped by any tap or key, then "Press start to play again".
 */
export function createFinishUi(win: HTMLElement, dialogue: Dialogue, playAgain: () => void): FinishUi {
  const clear = document.createElement('p');
  clear.className = 'stageclear';
  clear.textContent = finish.stageClear;
  clear.setAttribute('role', 'status');

  const credits = document.createElement('section');
  credits.className = 'credits';
  credits.setAttribute('aria-label', 'Credits');
  credits.tabIndex = -1;
  credits.hidden = true;
  credits.innerHTML = `
    <div class="credits-roll">${finish.credits.map((l, i) => `<p class="${i === 0 ? 'credits-title' : ''}">${esc(l)}</p>`).join('')}</div>
    <div class="credits-end" hidden><button type="button" class="press-start">${esc(finish.playAgain)}</button></div>`;
  win.append(clear, credits);

  // The Continue panel, shown in the dialogue box.
  const panel = document.createElement('div');
  panel.className = 'continue';
  panel.innerHTML = `
    <div class="continue-head">
      <h3 class="continue-title">${esc(finish.continueTitle)}</h3>
      <p class="continue-count" aria-hidden="true">9</p>
    </div>
    <p>${esc(finish.nextStagePrefix)} ${esc(finish.nextStage)}</p>
    <p>${esc(finish.earliestStart)}</p>
    <ul class="continue-actions">
      ${finish.buttons
        .map(
          (b) =>
            `<li><a class="px-link${b.primary ? ' px-link-primary' : ''}" href="${esc(b.href)}" rel="noopener">${esc(b.label)}</a></li>`,
        )
        .join('')}
      <li><button type="button" class="px-link px-link-quiet" data-credits>Credits</button></li>
    </ul>`;
  const countEl = panel.querySelector('.continue-count') as HTMLElement;
  const roll = credits.querySelector('.credits-roll') as HTMLElement;
  const end = credits.querySelector('.credits-end') as HTMLElement;
  const startBtn = credits.querySelector('.press-start') as HTMLButtonElement;

  let remaining = 9;
  let locked = false; // set at the first interaction and never cleared until play again
  let tickTimer = 0;
  let showTimer = 0;
  let lockTimer = 0;
  let inFinish = false;

  const unlisten = (): void => LOCK_EVENTS.forEach((e) => window.removeEventListener(e, lock, true));
  function lock(): void {
    locked = true;
    window.clearInterval(tickTimer);
    unlisten();
  }

  function showEnd(): void {
    roll.classList.remove('is-rolling');
    roll.hidden = true;
    end.hidden = false;
    startBtn.focus();
  }

  function rollCredits(): void {
    unlisten();
    window.clearInterval(tickTimer);
    credits.hidden = false;
    end.hidden = true;
    roll.hidden = false;
    credits.focus();
    if (prefersReducedMotion()) {
      showEnd();
      return;
    }
    roll.classList.remove('is-rolling');
    void roll.offsetWidth;
    roll.classList.add('is-rolling');
  }

  roll.addEventListener('animationend', showEnd);
  credits.addEventListener('pointerdown', () => {
    if (!end.hidden) return;
    showEnd();
  });
  document.addEventListener('keydown', (e) => {
    if (credits.hidden || !end.hidden || e.key === 'Tab' || e.key === 'Shift') return;
    showEnd();
  });
  startBtn.addEventListener('click', () => {
    credits.hidden = true;
    locked = false;
    remaining = 9;
    playAgain();
  });
  panel.querySelector('[data-credits]')!.addEventListener('click', () => {
    lock();
    rollCredits();
  });

  function startCountdown(): void {
    remaining = 9;
    countEl.textContent = String(remaining);
    window.clearInterval(tickTimer);
    tickTimer = window.setInterval(() => {
      remaining -= 1;
      countEl.textContent = String(Math.max(0, remaining));
      if (remaining <= 0) rollCredits();
    }, 1000);
    // listen only once the screen has settled, so the jump that brought us here does not count
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => {
      if (inFinish && !locked) LOCK_EVENTS.forEach((e) => window.addEventListener(e, lock, true));
    }, 500);
  }

  return {
    enter(): void {
      inFinish = true;
      clear.classList.add('is-on');
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => {
        clear.classList.remove('is-on');
        dialogue.openCustom('Finish', panel);
        if (locked) countEl.textContent = String(Math.max(0, remaining));
        else startCountdown();
      }, 1000);
    },
    leave(): void {
      inFinish = false;
      window.clearTimeout(showTimer);
      window.clearTimeout(lockTimer);
      window.clearInterval(tickTimer);
      unlisten();
      clear.classList.remove('is-on');
      credits.hidden = true;
    },
  };
}
