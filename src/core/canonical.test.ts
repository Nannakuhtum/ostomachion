import { describe, expect, it } from 'vitest';
import { PIECES, SIDE } from './construction';
import type { Vec } from './construction';
import { IDENTITY_POSE, transformRing } from './geometry';
import type { Pose } from './geometry';
import { SQUARE } from './targets';
import { isWin } from './rules';
import type { Placements } from './rules';
import { signature } from './canonical';

const reference: Placements = PIECES.map(() => IDENTITY_POSE);
const referenceSig = signature(reference);

const withPose = (base: Placements, index: number, pose: Pose): Placements =>
  base.map((p, i) => (i === index ? pose : p));

/** 180° rotation about the board center; maps each congruent pair member onto its partner. */
const ROT180: Pose = { flipped: false, rot: 2, tx: 12, ty: 12 };

type Sym = (v: Vec) => Vec;
const S = SIDE;
/** The 8 symmetries of the [0,12]² square (identity, 3 rotations, 4 reflections). */
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

/** Linear part of a pose applied to a single vertex: rot^k(flip(v)). */
function linear([x, y]: Vec, flipped: boolean, rot: number): Vec {
  let vx = flipped ? -x : x;
  let vy = y;
  for (let i = 0; i < rot; i++) {
    const t = vx;
    vx = -vy;
    vy = t;
  }
  return [vx, vy];
}

/**
 * Brute-force the unique pose that maps `vertices` exactly (vertex-by-vertex)
 * onto `target`, searching flipped × rot with translation fixed by the first
 * vertex. Throws if none matches.
 */
function solvePose(vertices: readonly Vec[], target: readonly Vec[]): Pose {
  for (const flipped of [false, true]) {
    for (const rot of [0, 1, 2, 3] as const) {
      const [lx, ly] = linear(vertices[0], flipped, rot);
      const pose: Pose = { flipped, rot, tx: target[0][0] - lx, ty: target[0][1] - ly };
      const out = transformRing(vertices, pose);
      if (out.every(([x, y], i) => x === target[i][0] && y === target[i][1])) return pose;
    }
  }
  throw new Error('no pose maps ring onto target');
}

/** Apply a board symmetry to the whole reference arrangement via composed poses. */
function symmetrized(sym: Sym): Placements {
  return PIECES.map((piece) => solvePose(piece.vertices, piece.vertices.map(sym)));
}

describe('signature determinism', () => {
  it('is deterministic across calls and across fresh pose objects', () => {
    const fresh: Placements = PIECES.map(() => ({ flipped: false, rot: 0, tx: 0, ty: 0 }));
    expect(signature(reference)).toBe(referenceSig);
    expect(signature(fresh)).toBe(referenceSig);
  });

  it('is a non-empty string listing all 14 polygons', () => {
    expect(referenceSig.length).toBeGreaterThan(0);
    expect(referenceSig.split('|')).toHaveLength(14);
  });
});

describe('symmetry invariance (8 square symmetries)', () => {
  it('every D4 image of the reference arrangement still wins and has the same signature', () => {
    for (const sym of D4) {
      const placements = symmetrized(sym);
      expect(isWin(placements, SQUARE)).toBe(true);
      expect(signature(placements)).toBe(referenceSig);
    }
  });

  it('reflections genuinely change some poses (sanity check the harness)', () => {
    const mirrored = symmetrized(D4[4]); // (x,y) -> (12-x, y)
    expect(mirrored.some((p) => p.flipped || p.rot !== 0 || p.tx !== 0 || p.ty !== 0)).toBe(true);
  });
});

describe('congruent-piece swap invariance', () => {
  it('swapping one congruent pair keeps the signature unchanged', () => {
    for (const [a, b] of [
      [0, 13],
      [5, 12],
    ] as const) {
      const swapped = withPose(withPose(reference, a, ROT180), b, ROT180);
      expect(signature(swapped)).toBe(referenceSig);
    }
  });

  it('swapping both congruent pairs keeps isWin true and the signature unchanged', () => {
    let swapped = reference;
    for (const i of [0, 13, 5, 12]) swapped = withPose(swapped, i, ROT180);
    expect(isWin(swapped, SQUARE)).toBe(true);
    expect(signature(swapped)).toBe(referenceSig);
  });
});

describe('distinct arrangements distinguished', () => {
  it('moving one piece to a different location changes the signature', () => {
    const moved = withPose(reference, 0, { flipped: false, rot: 0, tx: 20, ty: 0 });
    expect(signature(moved)).not.toBe(referenceSig);
  });

  it('nudging one piece inside the square changes the signature', () => {
    const nudged = withPose(reference, 4, { flipped: false, rot: 0, tx: 1, ty: 0 });
    expect(signature(nudged)).not.toBe(referenceSig);
  });
});
