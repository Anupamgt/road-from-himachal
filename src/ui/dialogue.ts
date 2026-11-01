import { site, ui, type Item, type Link, type Stage } from '../content';
import { prefersReducedMotion } from '../engine/prefs';

export interface Dialogue {
  /** Opens a stage's chapter text. */
  open(stage: Stage): void;
  /** Shows one inventory item's details in the box, with a way back. */
  openItem(item: Item): void;
  /** Opens the box with custom content in place of typed text (the Continue screen). */
  openCustom(title: string, body: HTMLElement): void;
  close(): void;
  /** Adds a ready element to the aside column (the chai save sheet). */
  setAsideNode(node: HTMLElement | null): void;
  /** Called when "Back" is pressed while an item is shown. */
  onBack(fn: () => void): void;
  /** The text shown in place of the box while the runner is between stones. */
  setHint(lead: string | null, next?: string): void;
}

interface Page {
  sub: string | null;
  text: string;
  /** A final page that only shows the aside (big number, note, stamp, extras) on narrow screens. */
  asideOnly?: boolean;
}

const NARROW = '(max-width: 700px)';
const PAGE_CHARS = 170; // about six lines of the dialogue text on a phone

/** Splits text into short pages at sentence ends so the box never has to scroll on a phone. */
function paginate(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let cur = '';
  for (const sentence of sentences) {
    if (cur && (cur + ' ' + sentence).length > PAGE_CHARS) {
      out.push(cur);
      cur = sentence;
    } else {
      cur = cur ? `${cur} ${sentence}` : sentence;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [text];
}

const CHARS_PER_MS = 45 / 1000;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function linkList(list: Link[]): string {
  return `<ul class="dlg-links">${list
    .map((l) => `<li><a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a></li>`)
    .join('')}</ul>`;
}

/**
 * Dialogue box: portrait, speaker, text typing at 45 characters a second. Any tap, click or key shows
 * the full text. A blinking triangle means more pages. "Read more" expands extra details in the box.
 * The full text is always in the DOM (selectable, read in full by screen readers); typing only
 * reveals it visually. Reduced motion and read mode show text at once.
 */
export function createDialogue(host: HTMLElement): Dialogue {
  const wrap = document.createElement('div');
  wrap.className = 'dialogue-wrap';
  wrap.innerHTML = `
    <div class="dialogue-shadow">
      <p class="run-hint pixel-box" id="run-hint"></p>
      <section class="dialogue pixel-box" id="dialogue" aria-labelledby="dlg-title">
        <div class="dialogue-inner pixel-box">
          <header class="dlg-who">
            <img class="dlg-portrait" src="${import.meta.env.BASE_URL}sprites/portrait_32.png" width="96" height="96" alt="" />
            <div>
              <p class="dlg-speaker">${esc(site.speaker)}</p>
              <h2 class="dlg-title" id="dlg-title"></h2>
            </div>
          </header>
          <div class="dlg-body">
            <p class="dlg-sub" hidden></p>
            <p class="dlg-text"><span class="typed"></span><span class="rest"></span></p>
            <div class="dlg-custom" hidden></div>
          </div>
          <aside class="dlg-aside" hidden>
            <div class="dlg-aside-text"></div>
            <div class="dlg-aside-node"></div>
            <div class="dlg-extra" id="dlg-extra" hidden></div>
          </aside>
          <footer class="dlg-actions">
            <button type="button" class="dlg-back" hidden>Back to items</button>
            <button type="button" class="dlg-readmore" aria-expanded="false" aria-controls="dlg-extra" hidden>${esc(ui.readMore)}</button>
            <button type="button" class="dlg-next" aria-label="Next page" hidden>
              <svg viewBox="0 0 10 8" width="20" height="16" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
                <path d="M0 0h10v2H8v2H6v2H4V4H2V2H0z" fill="#f2c230"/>
              </svg>
            </button>
          </footer>
        </div>
      </section>
    </div>`;
  host.appendChild(wrap);

  const hint = wrap.querySelector('#run-hint') as HTMLElement;
  const box = wrap.querySelector('#dialogue') as HTMLElement;
  const title = wrap.querySelector('#dlg-title') as HTMLElement;
  const sub = wrap.querySelector('.dlg-sub') as HTMLElement;
  const typed = wrap.querySelector('.typed') as HTMLElement;
  const rest = wrap.querySelector('.rest') as HTMLElement;
  const body = wrap.querySelector('.dlg-body') as HTMLElement;
  const extra = wrap.querySelector('#dlg-extra') as HTMLElement;
  const custom = wrap.querySelector('.dlg-custom') as HTMLElement;
  const inner = wrap.querySelector('.dialogue-inner') as HTMLElement;
  const aside = wrap.querySelector('.dlg-aside') as HTMLElement;
  const asideText = wrap.querySelector('.dlg-aside-text') as HTMLElement;
  const asideNode = wrap.querySelector('.dlg-aside-node') as HTMLElement;
  const readMore = wrap.querySelector('.dlg-readmore') as HTMLButtonElement;
  const back = wrap.querySelector('.dlg-back') as HTMLButtonElement;
  const next = wrap.querySelector('.dlg-next') as HTMLButtonElement;

  let isOpen = false;
  let pages: Page[] = [];
  let pageIndex = 0;
  let text = '';
  let shown = 0;
  let startedAt = 0;
  let raf = 0;
  let done = true;
  let backHandler: () => void = () => {};
  let extraAlwaysOpen = false;

  const hasNext = (): boolean => pageIndex < pages.length - 1;

  function paint(n: number): void {
    typed.textContent = text.slice(0, n);
    rest.textContent = text.slice(n);
  }

  function finishTyping(): void {
    cancelAnimationFrame(raf);
    shown = text.length;
    done = true;
    paint(shown);
    next.hidden = !hasNext();
  }

  function tick(now: number): void {
    const n = Math.min(text.length, Math.floor((now - startedAt) * CHARS_PER_MS));
    if (n !== shown) {
      shown = n;
      paint(n);
      // keep the typing line in view when the box is shorter than the text
      if (body.scrollHeight > body.clientHeight) body.scrollTop = body.scrollHeight;
      if (inner.scrollHeight > inner.clientHeight && getComputedStyle(inner).overflowY === 'auto') {
        // scroll only when the line being typed would fall below the visible bottom
        const rects = typed.getClientRects();
        const last = rects[rects.length - 1];
        const edge = inner.getBoundingClientRect().bottom - 12;
        if (last && last.bottom > edge) inner.scrollTop += last.bottom - edge;
      }
    }
    if (shown >= text.length) finishTyping();
    else raf = requestAnimationFrame(tick);
  }

  function showPage(i: number): void {
    pageIndex = i;
    const p = pages[i];
    sub.hidden = !p.sub;
    sub.textContent = p.sub ?? '';
    setAsideVisibility();
    if (window.matchMedia(NARROW).matches && !body.classList.contains('is-custom')) {
      readMore.hidden = !p.asideOnly || extra.innerHTML === '' || extraAlwaysOpen;
    }
    text = p.text;
    shown = 0;
    next.hidden = true;
    body.scrollTop = 0;
    inner.scrollTop = 0;
    requestAnimationFrame(() => {
      if (shown === 0) inner.scrollTop = 0;
    });
    cancelAnimationFrame(raf);
    done = false;
    if (prefersReducedMotion() || text.length === 0) {
      finishTyping();
      return;
    }
    paint(0);
    startedAt = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function advance(): void {
    if (!isOpen || body.classList.contains('is-custom')) return;
    if (!done) finishTyping();
    else if (hasNext()) showPage(pageIndex + 1);
  }

  function resetChrome(): void {
    body.classList.remove('is-custom');
    custom.hidden = true;
    custom.replaceChildren();
    back.hidden = true;
    asideNode.replaceChildren();
  }

  const asideEmpty = (): boolean =>
    asideText.childElementCount === 0 && asideNode.childElementCount === 0 && extra.hidden;

  /** Does this stage have anything for the aside column or for "Read more"? */
  const hasAsideContent = (): boolean =>
    asideText.childElementCount > 0 || asideNode.childElementCount > 0 || extra.innerHTML !== '';

  function setAsideVisibility(): void {
    const p = pages[pageIndex];
    const narrow = window.matchMedia(NARROW).matches;
    aside.hidden = asideEmpty() || (narrow && !p?.asideOnly);
  }

  /** Narrow screens: split long text into pages and put the aside on a last page of its own. */
  function fitToScreen(raw: Page[]): Page[] {
    if (!window.matchMedia(NARROW).matches) return raw;
    const out: Page[] = [];
    for (const r of raw) {
      paginate(r.text).forEach((chunk, i) => out.push({ sub: i === 0 ? r.sub : null, text: chunk }));
    }
    if (hasAsideContent()) out.push({ sub: null, text: '', asideOnly: true });
    return out;
  }

  function setExtras(parts: string[], expanded: boolean): void {
    extra.innerHTML = parts.join('');
    readMore.hidden = parts.length === 0 || expanded;
    extra.hidden = parts.length === 0 || !expanded;
    readMore.setAttribute('aria-expanded', String(expanded));
    readMore.textContent = ui.readMore;
    setAsideVisibility();
  }

  wrap.querySelector('.dialogue')!.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, .dlg-custom, .dlg-aside-node')) return;
    advance();
  });
  next.addEventListener('click', (e) => {
    e.stopPropagation();
    advance();
  });
  back.addEventListener('click', (e) => {
    e.stopPropagation();
    backHandler();
  });

  readMore.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = readMore.getAttribute('aria-expanded') !== 'true';
    readMore.setAttribute('aria-expanded', String(expanded));
    readMore.textContent = expanded ? ui.readLess : ui.readMore;
    extra.hidden = !expanded;
    setAsideVisibility();
    if (expanded) extra.scrollIntoView({ block: 'nearest' });
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen || body.classList.contains('is-custom') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Tab' || e.key === 'Shift') return;
    if (!done) {
      // any key shows the full text; scrolling keys still scroll the page
      finishTyping();
      return;
    }
    const active = document.activeElement;
    if (e.key === 'Enter' && hasNext() && (active === document.body || active === null)) {
      e.preventDefault();
      advance();
    }
  });

  function openBox(): void {
    isOpen = true;
    box.classList.add('is-open');
    wrap.classList.add('has-dialogue');
  }

  return {
    open(stage: Stage): void {
      resetChrome();
      extraAlwaysOpen = false;
      title.textContent = stage.km === null ? stage.title : `KM ${stage.km}, ${stage.title}`;

      // extras behind "Read more": extra details, the small line and links
      const parts: string[] = [];
      if (stage.readMore?.length) {
        parts.push(`<ul class="dlg-list">${stage.readMore.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`);
      }
      if (stage.smallLine) parts.push(`<p>${esc(stage.smallLine)}</p>`);
      if (stage.links?.length) parts.push(linkList(stage.links));
      // aside: the big figure, the margin note and the stamp
      const asideParts: string[] = [];
      if (stage.bigNumber) {
        asideParts.push(`<p class="dlg-big">${esc(stage.bigNumber.value)}</p>`);
        if (stage.bigNumber.caption) asideParts.push(`<p class="dlg-big-cap">${esc(stage.bigNumber.caption)}</p>`);
      }
      if (stage.note) asideParts.push(`<p class="dlg-note">${esc(stage.note)}</p>`);
      if (stage.stamp) asideParts.push(`<p class="dlg-stamp">${esc(stage.stamp)}</p>`);
      // wide screens with a free aside show the extra details at once, no button needed
      const roomy = window.matchMedia('(min-width: 1100px)').matches && asideParts.length === 0;
      setExtras(parts, roomy);
      asideText.innerHTML = asideParts.join('');
      setAsideVisibility();

      pages = fitToScreen([
        { sub: null, text: stage.text },
        ...(stage.blocks ?? []).map((b) => ({ sub: b.title, text: b.text })),
      ]);
      pageIndex = 0;
      openBox();
      showPage(0);
    },

    openItem(item: Item): void {
      resetChrome();
      title.textContent = item.name;
      extraAlwaysOpen = true;
      setExtras(item.links.length ? [linkList(item.links)] : [], true);
      const asideParts = [`<p class="dlg-stamp">${esc(item.tag)}</p>`];
      if (item.note) asideParts.push(`<p class="dlg-note">${esc(item.note)}</p>`);
      asideText.innerHTML = asideParts.join('');
      back.hidden = false;
      pages = fitToScreen([{ sub: null, text: item.details }]);
      pageIndex = 0;
      openBox();
      showPage(0);
    },

    openCustom(titleText: string, node: HTMLElement): void {
      resetChrome();
      cancelAnimationFrame(raf);
      pages = [{ sub: null, text: '' }];
      pageIndex = 0;
      title.textContent = titleText;
      asideText.innerHTML = '';
      setAsideVisibility();
      setExtras([], false);
      body.classList.add('is-custom');
      custom.hidden = false;
      custom.appendChild(node);
      next.hidden = true;
      done = true;
      openBox();
    },

    close(): void {
      isOpen = false;
      cancelAnimationFrame(raf);
      box.classList.remove('is-open');
      wrap.classList.remove('has-dialogue');
    },

    setAsideNode(node: HTMLElement | null): void {
      asideNode.replaceChildren(...(node ? [node] : []));
      // a node added after opening (the chai sheet) still needs its own page on a phone
      if (node && window.matchMedia(NARROW).matches && !pages.some((q) => q.asideOnly)) {
        pages.push({ sub: null, text: '', asideOnly: true });
        if (done) next.hidden = !hasNext();
      }
      setAsideVisibility();
    },

    onBack(fn: () => void): void {
      backHandler = fn;
    },

    setHint(lead: string | null, next = ''): void {
      hint.innerHTML = lead
        ? `<span class="hint-lead">${esc(lead)}</span>${next ? `<span class="hint-next">${esc(next)}</span>` : ''}`
        : '';
      hint.classList.toggle('is-on', Boolean(lead));
    },
  };
}
