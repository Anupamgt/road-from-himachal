import { iconCanvas } from '../art/icons';

export interface Flights {
  /** Flies an item icon from a point in the window to the item counter in 450ms. */
  fly(iconId: string, fromX: number, fromY: number, size: number, delayMs: number, done: () => void): void;
}

const MOVE = 'cubic-bezier(0.77, 0, 0.175, 1)'; // moving across the screen
const OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * The one celebratory moment: a collected item arcs into the HUD counter over 450ms. The path is two
 * nested transforms (x across, y arcing up then in), so only transform and opacity animate.
 */
export function createFlights(win: HTMLElement, target: () => HTMLElement): Flights {
  return {
    fly(iconId, fromX, fromY, size, delayMs, done): void {
      const outer = document.createElement('div');
      outer.className = 'flight';
      outer.style.left = `${fromX}px`;
      outer.style.top = `${fromY}px`;
      const inner = document.createElement('div');
      const icon = iconCanvas(iconId, 2);
      icon.style.width = `${size}px`;
      icon.style.height = `${size}px`;
      inner.appendChild(icon);
      outer.appendChild(inner);
      win.appendChild(outer);

      const w = win.getBoundingClientRect();
      const t = target().getBoundingClientRect();
      const dx = t.left + t.width / 2 - w.left - fromX - size / 2;
      const dy = t.top + t.height / 2 - w.top - fromY - size / 2;
      const opts = { duration: 450, delay: delayMs, fill: 'both' as FillMode };

      outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { ...opts, easing: MOVE });
      const anim = inner.animate(
        [
          { transform: 'translateY(0) scale(1)', opacity: 1, easing: OUT },
          { transform: 'translateY(-34px) scale(1)', opacity: 1, offset: 0.38, easing: MOVE },
          { transform: `translateY(${dy}px) scale(0.6)`, opacity: 0.9 },
        ],
        { ...opts, easing: 'linear' },
      );
      anim.onfinish = () => {
        outer.remove();
        done();
      };
    },
  };
}
