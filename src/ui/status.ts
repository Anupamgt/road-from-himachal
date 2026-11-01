import { iconCanvas } from '../art/icons';
import { stages, status } from '../content';

export interface StatusScreen {
  enter(): void;
  leave(): void;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * KM 7 status screen: portrait, who I am, three skills with buttons that jump to the stone that
 * proves each, and the record (real numbers only; no bars, levels or invented stats).
 */
export function createStatus(win: HTMLElement, onJump: (stageId: string) => void): StatusScreen {
  const el = document.createElement('section');
  el.className = 'panel status';
  el.setAttribute('aria-label', 'Status');
  el.hidden = true;

  const stageOf = (km: number) => stages.find((s) => s.km === km)!;

  el.innerHTML = `
    <div class="st-who">
      <img class="st-portrait" src="${import.meta.env.BASE_URL}sprites/portrait_32.png" width="192" height="192" alt="" />
      <dl class="st-rows">${status.rows
        .map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`)
        .join('')}</dl>
    </div>
    <div class="st-skills">
      <h3 class="panel-title">Skills</h3>
      <ul>${status.skills
        .map(
          (s) => `
        <li class="skill" data-skill="${s.id}">
          <span class="skill-icon"></span>
          <div>
            <p class="skill-name">${esc(s.name)}</p>
            <p class="skill-text">${esc(s.text)}</p>
          </div>
          <p class="skill-jumps">${s.jumpTo
              .map((km) => {
                const st = stageOf(km);
                return `<button type="button" class="jump" data-id="${st.id}" aria-label="Jump to ${esc(st.mapLabel)}">KM ${km}</button>`;
              })
              .join('')}</p>
        </li>`,
        )
        .join('')}</ul>
    </div>
    <div class="st-record">
      <h3 class="panel-title">${esc(status.recordTitle)}</h3>
      <ul>${status.record.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>`;

  status.skills.forEach((s) => {
    el.querySelector(`[data-skill="${s.id}"] .skill-icon`)!.appendChild(iconCanvas(s.icon, 3));
  });
  el.querySelectorAll<HTMLButtonElement>('.jump').forEach((b) =>
    b.addEventListener('click', () => onJump(b.dataset.id as string)),
  );
  win.appendChild(el);

  return {
    enter(): void {
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-on'));
    },
    leave(): void {
      el.classList.remove('is-on');
      el.hidden = true;
    },
  };
}
