export interface Hud {
  setKm(label: string): void;
  setProgress(p: number): void;
  setItems(n: number): void;
  /** A small pop on the counter when an item lands. */
  pop(): void;
  /** The counter element, the target of the item flights. */
  counter(): HTMLElement;
}

/** Heads-up display across the top of the game window: KM, EXP bar, item counter. */
export function createHud(host: HTMLElement): Hud {
  const el = document.createElement('div');
  el.className = 'hud';
  el.innerHTML = `
    <span class="hud-km">KM 0</span>
    <span class="hud-exp">
      <span class="hud-label">EXP</span>
      <span class="hud-track" role="progressbar" aria-label="Progress through the road" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="hud-fill"></span>
      </span>
    </span>
    <span class="hud-items">ITEMS <span class="hud-count">0</span></span>`;
  host.appendChild(el);

  const km = el.querySelector('.hud-km') as HTMLElement;
  const track = el.querySelector('.hud-track') as HTMLElement;
  const fill = el.querySelector('.hud-fill') as HTMLElement;
  const count = el.querySelector('.hud-count') as HTMLElement;
  let lastKm = '';
  let lastPct = -1;

  return {
    setKm(label: string): void {
      if (label !== lastKm) {
        km.textContent = label;
        lastKm = label;
      }
    },
    setProgress(p: number): void {
      const clamped = Math.max(0, Math.min(1, p));
      // transform only: the fill is scaled, never resized
      fill.style.transform = `scaleX(${clamped.toFixed(4)})`;
      const pct = Math.round(clamped * 100);
      if (pct !== lastPct) {
        track.setAttribute('aria-valuenow', String(pct));
        lastPct = pct;
      }
    },
    setItems(n: number): void {
      count.textContent = String(n);
    },
    pop(): void {
      const box = count.parentElement as HTMLElement;
      box.classList.add('is-pop');
      window.setTimeout(() => box.classList.remove('is-pop'), 120);
    },
    counter: () => count,
  };
}
