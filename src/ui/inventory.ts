import { iconCanvas } from '../art/icons';
import { highScores, items, type Item } from '../content';

export interface Inventory {
  enter(): void;
  leave(): void;
  clearSelection(): void;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slot(item: Item, big: boolean): HTMLLIElement {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `slot ${big ? 'slot-big' : 'slot-row'}`;
  b.dataset.id = item.id;
  b.setAttribute('aria-pressed', 'false');
  b.appendChild(iconCanvas(item.icon, big ? 4 : 2));
  const text = document.createElement('span');
  text.className = 'slot-text';
  text.innerHTML = `<span class="slot-name">${esc(item.name)}</span><span class="slot-line">${esc(item.line)}</span>`;
  b.appendChild(text);
  const tag = document.createElement('span');
  tag.className = 'slot-tag';
  tag.textContent = item.tag;
  b.appendChild(tag);
  li.appendChild(b);
  return li;
}

/**
 * KM 5 inventory: a menu over the game window. Three large flagship slots, a slimmer list of team
 * items, and the high scores board. Tapping an item opens its details in the dialogue box.
 */
export function createInventory(win: HTMLElement, onOpen: (item: Item) => void): Inventory {
  const el = document.createElement('section');
  el.className = 'panel inv';
  el.setAttribute('aria-label', 'Items');
  el.hidden = true;

  const main = document.createElement('div');
  main.className = 'inv-main';
  main.innerHTML = '<h3 class="panel-title">Items</h3>';
  const flagship = document.createElement('ul');
  flagship.className = 'inv-flagship';
  items.flagship.forEach((i) => flagship.appendChild(slot(i, true)));
  const team = document.createElement('ul');
  team.className = 'inv-team';
  items.team.forEach((i) => team.appendChild(slot(i, false)));
  main.append(flagship, team);

  const scores = document.createElement('aside');
  scores.className = 'inv-scores';
  scores.innerHTML = `<h3 class="panel-title score-title">${esc(highScores.title)}</h3>
    <ul class="score-list">${highScores.rows
      .map((row) => {
        const at = row.indexOf(':');
        const name = row.slice(0, at);
        const result = row.slice(at + 1).trim();
        return `<li><span class="score-name">${esc(name)}</span><span class="score-result">${esc(result)}</span></li>`;
      })
      .join('')}</ul>`;

  el.append(main, scores);
  win.appendChild(el);

  const buttons = [...el.querySelectorAll<HTMLButtonElement>('.slot')];
  const all = [...items.flagship, ...items.team];
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const item = all.find((i) => i.id === b.dataset.id);
      if (!item) return;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onOpen(item);
    }),
  );

  return {
    enter(): void {
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-on'));
    },
    leave(): void {
      el.classList.remove('is-on');
      el.hidden = true;
      this.clearSelection();
    },
    clearSelection(): void {
      buttons.forEach((x) => x.setAttribute('aria-pressed', 'false'));
    },
  };
}
