import { SIDE } from './construction';
import type { Region } from './geometry';

/**
 * The classic 12×12 square target. Convex, so vertex containment suffices.
 * Figure regions (non-convex lattice polygons) will join here later behind
 * the same Region interface.
 */
export const SQUARE: Region = {
  area: SIDE * SIDE,
  outline: [
    [0, 0],
    [SIDE, 0],
    [SIDE, SIDE],
    [0, SIDE],
  ],
  contains(ring) {
    return ring.every(([x, y]) => x >= 0 && x <= SIDE && y >= 0 && y <= SIDE);
  },
};
