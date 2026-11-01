import { chai } from '../content';
import { prefersReducedMotion } from '../engine/prefs';
import { runtime } from '../runtime';
import type { Layout } from '../scenes/base';
import type { Dialogue } from './dialogue';

export interface Chai {
  enter(): void;
  leave(): void;
  /** Positions the kettle button over the kettle drawn in the scene. */
  place(L: Layout, s: number): void;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const split = (row: string): [string, string] => {
  const at = row.indexOf(':');
  return [row.slice(0, at), row.slice(at + 1).trim()];
};

/**
 * KM 6: the save point. A paper sheet styled like a site daily progress report slides up in the
 * dialogue box, and the kettle (tap, click or keyboard) pours a second cutting chai.
 */
export function createChai(win: HTMLElement, dialogue: Dialogue, onChange: () => void): Chai {
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  const [oneLabel, oneValue] = split(chai.save.chai.one);
  const [, twoValue] = split(chai.save.chai.two);
  sheet.innerHTML = `
    <h3 class="sheet-title">${esc(chai.save.heading)}</h3>
    <dl class="sheet-rows">
      ${chai.save.rows.map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('')}
      <div><dt>${esc(oneLabel)}</dt><dd class="chai-value">${esc(oneValue)}</dd></div>
    </dl>
    <p class="sr-only">On the chalkboard: ${esc(chai.chalkboard.join(' '))}</p>`;
  const chaiValue = sheet.querySelector('.chai-value') as HTMLElement;

  const kettle = document.createElement('button');
  kettle.type = 'button';
  kettle.className = 'hotspot';
  kettle.hidden = true;
  kettle.setAttribute('aria-label', 'Kettle. Pour one more cutting chai.');
  const bubble = document.createElement('p');
  bubble.className = 'bubble';
  bubble.setAttribute('aria-live', 'polite');
  win.append(kettle, bubble);

  let bubbleTimer = 0;
  let kettleX = 0;
  let kettleBottom = 0;
  const sync = (): void => {
    chaiValue.textContent = runtime.glasses >= 2 ? twoValue : oneValue;
  };

  kettle.addEventListener('click', () => {
    if (runtime.glasses < 2) {
      runtime.glasses = 2;
      sync();
      onChange();
      bubble.textContent = chai.save.kettlePrompt;
      // below the kettle, kept inside the window, so it never covers the chalkboard
      const half = bubble.offsetWidth / 2 + 6;
      bubble.style.left = `${Math.max(half, Math.min(kettleX, win.clientWidth - half))}px`;
      bubble.style.top = `${kettleBottom}px`;
      bubble.classList.add('is-on');
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-on'), 2000);
    }
  });

  return {
    enter(): void {
      sync();
      sheet.classList.remove('is-on');
      dialogue.setAsideNode(sheet);
      kettle.hidden = false;
      // paint the hidden state first so the slide-up transition runs
      void sheet.offsetWidth;
      requestAnimationFrame(() => sheet.classList.add('is-on'));
      if (prefersReducedMotion()) sheet.classList.add('is-on');
    },
    leave(): void {
      kettle.hidden = true;
      bubble.classList.remove('is-on');
      window.clearTimeout(bubbleTimer);
    },
    place(L: Layout, s: number): void {
      const size = Math.max(44, 18 * s);
      const cx = (L.runnerCx + 67) * s;
      const cy = (L.yRoad - 19) * s;
      kettle.style.width = `${size}px`;
      kettle.style.height = `${size}px`;
      kettle.style.left = `${cx - size / 2}px`;
      kettle.style.top = `${cy - size / 2}px`;
      kettleX = cx;
      kettleBottom = cy + size / 2 + 4;
    },
  };
}
