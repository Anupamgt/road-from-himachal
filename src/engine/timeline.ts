import { stages } from '../content';

// Scroll timeline. The page is one tall scroller with a pinned game window. Each stage has a run
// segment (the runner moves while the page scrolls) followed by a hold segment (the runner stands
// at the kilometre stone and the dialogue is open). KM 0 has no run: the first stone is the start line.

export interface Segment {
  id: string;
  index: number;
  runStart: number;
  runLen: number;
  holdStart: number;
  holdEnd: number;
  /** Scroll pixels run in total before this segment's run begins. */
  travelStart: number;
}

export interface Timeline {
  segments: Segment[];
  /** Total scrollable distance (scrollY range). */
  total: number;
  /** Height to give the scroller element. */
  scrollerHeight: number;
}

export interface Where {
  segment: Segment;
  phase: 'run' | 'hold';
  /** Scroll pixels run since the last stone while in a run segment; 0 in a hold. */
  runDistance: number;
  /** Total scroll pixels run since the start (holds add nothing). */
  travel: number;
}

export function buildTimeline(viewportH: number): Timeline {
  const runLen = Math.round(Math.max(700, viewportH * 1.1));
  const holdLen = Math.round(Math.max(600, viewportH * 0.8));
  const segments: Segment[] = [];
  let cursor = 0;
  let travel = 0;
  stages.forEach((stage, i) => {
    const run = i === 0 ? 0 : runLen;
    const runStart = cursor;
    const holdStart = runStart + run;
    const holdEnd = holdStart + holdLen;
    segments.push({ id: stage.id, index: i, runStart, runLen: run, holdStart, holdEnd, travelStart: travel });
    cursor = holdEnd;
    travel += run;
  });
  return { segments, total: cursor, scrollerHeight: cursor + viewportH };
}

export function whereIs(tl: Timeline, scrollY: number): Where {
  const y = Math.max(0, Math.min(tl.total, scrollY));
  for (const segment of tl.segments) {
    if (y < segment.holdStart) {
      const runDistance = y - segment.runStart;
      return { segment, phase: 'run', runDistance, travel: segment.travelStart + runDistance };
    }
    if (y <= segment.holdEnd) {
      return { segment, phase: 'hold', runDistance: 0, travel: segment.travelStart + segment.runLen };
    }
  }
  const last = tl.segments[tl.segments.length - 1];
  return { segment: last, phase: 'hold', runDistance: 0, travel: last.travelStart + last.runLen };
}

export function segmentById(tl: Timeline, id: string): Segment {
  const s = tl.segments.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown stage: ${id}`);
  return s;
}

/** Jump without any running animation (instant, whatever the CSS says). */
export function jumpTo(tl: Timeline, id: string): void {
  const s = segmentById(tl, id);
  window.scrollTo({ top: s.holdStart + 1, behavior: 'instant' as ScrollBehavior });
}
