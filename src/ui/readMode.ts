import {
  chai,
  contact,
  finish,
  highScores,
  items,
  itemCount,
  site,
  stages,
  status,
  type Item,
  type Link,
  type Stage,
} from '../content';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function links(list: Link[] | undefined): string {
  if (!list || list.length === 0) return '';
  return `<ul class="r-links">${list
    .map((l) => `<li><a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a></li>`)
    .join('')}</ul>`;
}

function heading(stage: Stage): string {
  return stage.km === null ? esc(stage.title) : `KM ${stage.km}, ${esc(stage.title)}`;
}

function stageBlocks(stage: Stage): string {
  const parts: string[] = [];
  if (stage.bigNumber) {
    parts.push(
      `<p class="r-big">${esc(stage.bigNumber.value)}${
        stage.bigNumber.caption ? `<span class="r-big-cap">${esc(stage.bigNumber.caption)}</span>` : ''
      }</p>`,
    );
  }
  if (stage.text) parts.push(`<p>${esc(stage.text)}</p>`);
  for (const b of stage.blocks ?? []) {
    parts.push(`<h3>${esc(b.title)}</h3><p>${esc(b.text)}</p>`);
  }
  if (stage.readMore?.length) {
    parts.push(`<ul class="r-list">${stage.readMore.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`);
  }
  if (stage.smallLine) parts.push(`<p class="r-small">${esc(stage.smallLine)}</p>`);
  if (stage.note) parts.push(`<p class="r-note">${esc(stage.note)}</p>`);
  if (stage.stamp) parts.push(`<p class="r-stamp">${esc(stage.stamp)}</p>`);
  parts.push(links(stage.links));
  return parts.join('');
}

function itemHtml(item: Item): string {
  return `<li class="r-item">
    <h4>${esc(item.name)} <span class="r-tag">${esc(item.tag)}</span></h4>
    <p class="r-line">${esc(item.line)}</p>
    <p>${esc(item.details)}</p>
    ${item.note ? `<p class="r-note">${esc(item.note)}</p>` : ''}
    ${links(item.links)}
  </li>`;
}

function itemsSection(): string {
  return `
    <h3>Items (${itemCount})</h3>
    <ul class="r-items">${items.flagship.map(itemHtml).join('')}</ul>
    <ul class="r-items r-items-team">${items.team.map(itemHtml).join('')}</ul>
    <h3>${esc(highScores.title)}</h3>
    <ul class="r-list">${highScores.rows.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
}

function chaiSection(): string {
  return `
    <h3>On the chalkboard</h3>
    <p>${chai.chalkboard.map(esc).join(' ')}</p>
    <h3>${esc(chai.save.heading)}</h3>
    <ul class="r-list">
      ${chai.save.rows.map((r) => `<li>${esc(r.label)}: ${esc(r.value)}</li>`).join('')}
      <li>${esc(chai.save.chai.one)}</li>
    </ul>`;
}

function statusSection(): string {
  return `
    <dl class="r-status">${status.rows
      .map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`)
      .join('')}</dl>
    <ul class="r-skills">${status.skills
      .map(
        (s) =>
          `<li><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p><p class="r-small">Proof: ${s.jumpTo
            .map((k) => `<a href="#km${k}">KM ${k}</a>`)
            .join(', ')}</p></li>`,
      )
      .join('')}</ul>
    <h3>${esc(status.recordTitle)}</h3>
    <ul class="r-list">${status.record.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
}

function finishSection(): string {
  return `
    <p>${esc(finish.nextStagePrefix)} ${esc(finish.nextStage)}</p>
    <p>${esc(finish.earliestStart)}</p>
    <ul class="r-actions">${finish.buttons
      .map(
        (b) =>
          `<li><a class="r-btn${b.primary ? ' r-btn-primary' : ''}" href="${esc(b.href)}" rel="noopener">${esc(b.label)}</a></li>`,
      )
      .join('')}</ul>`;
}

function extras(stage: Stage): string {
  switch (stage.id) {
    case 'km5':
      return itemsSection();
    case 'km6':
      return chaiSection();
    case 'km7':
      return statusSection();
    case 'finish':
      return finishSection();
    default:
      return '';
  }
}

export function renderReadMode(root: HTMLElement): void {
  const sections = stages
    .map(
      (stage) => `
    <section class="r-stage" id="${stage.id}" aria-labelledby="${stage.id}-h">
      <h2 id="${stage.id}-h">${heading(stage)}</h2>
      <div class="r-body">${stageBlocks(stage)}${extras(stage)}</div>
    </section>`,
    )
    .join('');

  root.innerHTML = `
    <header class="r-head">
      <h1>${esc(site.name)}</h1>
      <p class="r-tag-line">${esc(site.tagline)}</p>
      <p class="r-contact"><a href="${esc(contact.mailto)}">${esc(contact.email)}</a></p>
    </header>
    ${sections}`;
}
