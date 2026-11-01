import { stages } from '../content';

export interface StageMap {
  setCurrent(index: number): void;
}

/** Pixel route with one dot per stop. Click or keyboard jumps there instantly. */
export function createStageMap(host: HTMLElement, onJump: (id: string) => void): StageMap {
  const nav = document.createElement('nav');
  nav.className = 'stagemap';
  nav.setAttribute('aria-label', 'Stage map');
  nav.innerHTML = `<ol class="route">${stages
    .map(
      (s, i) => `
      <li class="stop" data-edge="${i <= 1 ? 'start' : i >= stages.length - 2 ? 'end' : ''}">
        <button type="button" class="stop-btn" data-id="${s.id}" aria-label="${s.mapLabel}">
          <span class="stop-dot" aria-hidden="true"></span>
          <span class="stop-label" aria-hidden="true">${s.mapLabel}</span>
        </button>
      </li>`,
    )
    .join('')}</ol>`;
  host.appendChild(nav);

  const buttons = [...nav.querySelectorAll<HTMLButtonElement>('.stop-btn')];
  buttons.forEach((b) => b.addEventListener('click', () => onJump(b.dataset.id as string)));

  let current = -1;
  return {
    setCurrent(index: number): void {
      if (index === current) return;
      current = index;
      buttons.forEach((b, i) => {
        b.classList.toggle('is-passed', i < index);
        b.classList.toggle('is-current', i === index);
        if (i === index) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
    },
  };
}
