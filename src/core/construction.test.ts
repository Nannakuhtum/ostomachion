import { describe, expect, it } from 'vitest';
import { PIECES, SIDE } from './construction';
import type { Ring } from './construction';
import { area, signedArea2 } from './geometry';

/** Cross product sign of consecutive edges around the ring. */
function crossSigns(ring: Ring): number[] {
  const n = ring.length;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[(i + 1) % n];
    const [cx, cy] = ring[(i + 2) % n];
    out.push(Math.sign((bx - ax) * (cy - by) - (by - ay) * (cx - bx)));
  }
  return out;
}

describe('Suter construction invariants', () => {
  it('SIDE is 12', () => {
    expect(SIDE).toBe(12);
  });

  it('produces exactly 14 pieces with stable ids p0..p13', () => {
    expect(PIECES).toHaveLength(14);
    PIECES.forEach((p, i) => expect(p.id).toBe(`p${i}`));
  });

  it('every vertex is an integer lattice point within [0,12]', () => {
    for (const piece of PIECES) {
      for (const [x, y] of piece.vertices) {
        expect(Number.isInteger(x)).toBe(true);
        expect(Number.isInteger(y)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(SIDE);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(SIDE);
      }
    }
  });

  it('every piece is strictly convex: no zero-length edges, no repeated vertices, all turns one sign', () => {
    for (const piece of PIECES) {
      const ring = piece.vertices;
      // no repeated vertices
      const seen = new Set(ring.map(([x, y]) => `${x},${y}`));
      expect(seen.size).toBe(ring.length);
      // no zero-length edges
      for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i];
        const [x2, y2] = ring[(i + 1) % ring.length];
        expect(x1 !== x2 || y1 !== y2).toBe(true);
      }
      // strictly convex: all cross products non-zero and of one sign
      const signs = crossSigns(ring);
      expect(signs.every((s) => s !== 0)).toBe(true);
      expect(new Set(signs).size).toBe(1);
    }
  });

  it('area multiset is [3,3,6,6,6,6,9,12,12,12,12,12,21,24] and sums to 144', () => {
    const areas = PIECES.map((p) => area(p.vertices)).sort((a, b) => a - b);
    expect(areas).toEqual([3, 3, 6, 6, 6, 6, 9, 12, 12, 12, 12, 12, 21, 24]);
    expect(areas.reduce((s, a) => s + a, 0)).toBe(144);
  });

  it('each area is a positive integer multiple of 3', () => {
    for (const piece of PIECES) {
      const a = area(piece.vertices);
      expect(a).toBeGreaterThan(0);
      expect(Number.isInteger(a)).toBe(true);
      expect(a % 3).toBe(0);
    }
  });

  it('polygon type counts: 11 triangles, 2 quadrilaterals, 1 pentagon', () => {
    const counts = new Map<number, number>();
    for (const piece of PIECES) {
      const n = piece.vertices.length;
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    expect(counts.get(3)).toBe(11);
    expect(counts.get(4)).toBe(2);
    expect(counts.get(5)).toBe(1);
    expect([...counts.keys()].sort()).toEqual([3, 4, 5]);
  });

  it('signedArea2 is an even integer for every piece (integer areas)', () => {
    for (const piece of PIECES) {
      const s2 = signedArea2(piece.vertices);
      expect(Number.isInteger(s2)).toBe(true);
      expect(Math.abs(s2) % 2).toBe(0);
    }
  });

  it('congruent pairs 0↔13 and 5↔12 map onto each other under 180° rotation about the center', () => {
    const rot180 = ([x, y]: readonly [number, number]) => `${SIDE - x},${SIDE - y}`;
    const asSet = (ring: Ring) => new Set(ring.map(([x, y]) => `${x},${y}`));
    for (const [a, b] of [
      [0, 13],
      [5, 12],
    ] as const) {
      const mapped = new Set(PIECES[a].vertices.map(rot180));
      expect(mapped).toEqual(asSet(PIECES[b].vertices));
    }
  });
});
