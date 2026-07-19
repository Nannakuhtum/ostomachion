import { SIDE } from './construction';
import type { Ring, Vec } from './construction';
import { signedArea2 } from './geometry';
import type { Placements } from './rules';
import { placedRings } from './rules';

/**
 * Canonical signature of a winning arrangement.
 *
 * Geometry-only: piece identity is discarded, so swapping congruent pieces
 * cannot change the signature. Minimized over the 8 symmetries of the square,
 * matching Cutler's equivalence (17,152 placements / 32 = 536 solutions;
 * the 32 = 8 board symmetries × 4 congruent-pair swaps).
 */

type Sym = (v: Vec) => Vec;

const S = SIDE;
const D4: readonly Sym[] = [
  ([x, y]) => [x, y],
  ([x, y]) => [S - y, x],
  ([x, y]) => [S - x, S - y],
  ([x, y]) => [y, S - x],
  ([x, y]) => [S - x, y],
  ([x, y]) => [x, S - y],
  ([x, y]) => [y, x],
  ([x, y]) => [S - y, S - x],
];

/** Fixed winding, then the lexicographically smallest vertex rotation. */
function canonicalRing(ring: Ring): Vec[] {
  let r = [...ring];
  if (signedArea2(r) < 0) r.reverse();
  const rotations: Vec[][] = r.map((_, i) => [...r.slice(i), ...r.slice(0, i)]);
  rotations.sort((a, b) => key(a).localeCompare(key(b)));
  return rotations[0];
}

const key = (ring: readonly Vec[]): string => ring.map(([x, y]) => `${x},${y}`).join(' ');

export function signature(placements: Placements): string {
  const rings = placedRings(placements);
  const candidates = D4.map((sym) => {
    const polys = rings.map((ring) => key(canonicalRing(ring.map(sym))));
    polys.sort();
    return polys.join('|');
  });
  candidates.sort();
  return candidates[0];
}
