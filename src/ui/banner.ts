export interface Banner {
  show(text: string, turning?: boolean): void;
  hide(): void;
}

/**
 * Checkpoint banner. It drops in from 8px above with a 240ms fade, stays 1s, then fades out in
 * 180ms. Class toggles drive CSS transitions (so a quick re-trigger retargets instead of restarting).
 * Under reduced motion the CSS keeps the fade and drops the movement.
 */
export function createBanner(host: HTMLElement): Banner {
  const el = document.createElement('div');
  el.className = 'banner';
  el.setAttribute('aria-hidden', 'true');
  host.appendChild(el);
  let timer = 0;

  return {
    show(text: string, turning = false): void {
      window.clearTimeout(timer);
      el.textContent = text;
      el.classList.toggle('is-turning', turning);
      // restart from the hidden state so the entrance always plays
      el.classList.remove('is-in');
      void el.offsetWidth;
      el.classList.add('is-in');
      timer = window.setTimeout(() => el.classList.remove('is-in'), 240 + 1000);
    },
    hide(): void {
      window.clearTimeout(timer);
      el.classList.remove('is-in');
    },
  };
}
