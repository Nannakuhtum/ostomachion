import { PIECES } from './construction';
import type { Pose, Region } from './geometry';
import { area, convexOverlap, transformRing } from './geometry';
import type { Ring } from './construction';

/** Placements keyed by piece index, in PIECES order. */
export type Placements = readonly Pose[];

export const TOTAL_PIECE_AREA = PIECES.reduce((s, p) => s + area(p.vertices), 0);

export function placedRings(placements: Placements): Ring[] {
  return PIECES.map((p, i) => transformRing(p.vertices, placements[i]));
}

/**
 * Exact tiling test: every piece contained ∧ no pair of interiors intersect
 * ∧ piece areas sum to the region area. Sufficient by pigeonhole; areas are
 * pose-invariant so the sum check is a region-area comparison.
 */
export function isWin(placements: Placements, region: Region): boolean {
  if (TOTAL_PIECE_AREA !== region.area) return false;
  const rings = placedRings(placements);
  if (!rings.every((r) => region.contains(r))) return false;
  for (let i = 0; i < rings.length; i++) {
    for (let j = i + 1; j < rings.length; j++) {
      if (convexOverlap(rings[i], rings[j])) return false;
    }
  }
  return true;
}
