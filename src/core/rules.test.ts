import { describe, expect, it } from 'vitest';
import { PIECES } from './construction';
import { IDENTITY_POSE, area } from './geometry';
import type { Pose } from './geometry';
import { SQUARE } from './targets';
import { TOTAL_PIECE_AREA, isWin, placedRings } from './rules';
import type { Placements } from './rules';

const reference: Placements = PIECES.map(() => IDENTITY_POSE);

const withPose = (base: Placements, index: number, pose: Pose): Placements =>
  base.map((p, i) => (i === index ? pose : p));

/** 180° rotation about the board center; maps each congruent pair member onto its partner. */
const ROT180: Pose = { flipped: false, rot: 2, tx: 12, ty: 12 };

describe('TOTAL_PIECE_AREA and placedRings', () => {
  it('total piece area equals the square area, 144', () => {
    expect(TOTAL_PIECE_AREA).toBe(144);
    expect(TOTAL_PIECE_AREA).toBe(SQUARE.area);
  });

  it('placedRings under the reference returns the as-constructed rings in order', () => {
    const rings = placedRings(reference);
    expect(rings).toHaveLength(14);
    rings.forEach((r, i) => expect(r).toEqual(PIECES[i].vertices));
  });

  it('placedRings applies each pose to the matching piece', () => {
    const shifted = withPose(reference, 3, { flipped: false, rot: 0, tx: 2, ty: -1 });
    const rings = placedRings(shifted);
    expect(rings[3]).toEqual(PIECES[3].vertices.map(([x, y]) => [x + 2, y - 1]));
    expect(rings[0]).toEqual(PIECES[0].vertices);
    expect(area(rings[3])).toBe(area(PIECES[3].vertices));
  });
});

describe('isWin', () => {
  it('the reference (Suter) arrangement wins', () => {
    expect(isWin(reference, SQUARE)).toBe(true);
  });

  it('any piece translated by (20,0) leaves the square: not a win', () => {
    for (let i = 0; i < PIECES.length; i++) {
      const p = withPose(reference, i, { flipped: false, rot: 0, tx: 20, ty: 0 });
      expect(isWin(p, SQUARE)).toBe(false);
    }
  });

  it('two pieces stacked on the same footprint: not a win', () => {
    // Move piece 0 onto piece 13's reference footprint while piece 13 stays put.
    const stacked = withPose(reference, 0, ROT180);
    expect(isWin(stacked, SQUARE)).toBe(false);
  });

  it('a piece nudged by (1,0) but still inside the square creates overlap: not a win', () => {
    // Piece 4 is the small triangle (2,8)-(3,6)-(3,12); shifted right it stays
    // inside the square but must intrude into a neighbour's interior.
    const nudged = withPose(reference, 4, { flipped: false, rot: 0, tx: 1, ty: 0 });
    const rings = placedRings(nudged);
    expect(SQUARE.contains(rings[4])).toBe(true);
    expect(isWin(nudged, SQUARE)).toBe(false);
  });

  it('nudging any piece by (1,0) never wins', () => {
    for (let i = 0; i < PIECES.length; i++) {
      const nudged = withPose(reference, i, { flipped: false, rot: 0, tx: 1, ty: 0 });
      expect(isWin(nudged, SQUARE)).toBe(false);
    }
  });

  it('swapping a congruent pair via the 180° pose still wins', () => {
    for (const [a, b] of [
      [0, 13],
      [5, 12],
    ] as const) {
      const swapped = withPose(withPose(reference, a, ROT180), b, ROT180);
      expect(isWin(swapped, SQUARE)).toBe(true);
    }
  });

  it('swapping both congruent pairs still wins', () => {
    let swapped = reference;
    for (const i of [0, 13, 5, 12]) swapped = withPose(swapped, i, ROT180);
    expect(isWin(swapped, SQUARE)).toBe(true);
  });

  it('rejects a region whose area does not match the piece total', () => {
    const smaller = { ...SQUARE, area: 143 };
    expect(isWin(reference, smaller)).toBe(false);
  });
});
