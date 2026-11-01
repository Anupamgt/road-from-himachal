import { items, type Item } from '../content';

/** The seven items in the order the runner collects them: three flagship, then four team. */
export const ALL_ITEMS: Item[] = [...items.flagship, ...items.team];

/**
 * Where each floating item sits, in art pixels right of the runner at the moment he stands at the
 * KM 5 stone (negative: the runner passes it on the way in). The first item is passed first.
 */
export function itemDx(k: number): number {
  return -250 + k * 35;
}
