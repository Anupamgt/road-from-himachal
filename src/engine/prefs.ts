// Preferences: read mode (remembered in localStorage) and reduced motion.

const READ_KEY = 'rfh.readMode';

export function loadReadMode(): boolean {
  try {
    return localStorage.getItem(READ_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveReadMode(on: boolean): void {
  try {
    localStorage.setItem(READ_KEY, on ? '1' : '0');
  } catch {
    /* storage can be blocked; the page still works without it */
  }
}

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion(): boolean {
  return reducedQuery.matches;
}

export function onReducedMotionChange(fn: (reduced: boolean) => void): void {
  reducedQuery.addEventListener('change', () => fn(reducedQuery.matches));
}
