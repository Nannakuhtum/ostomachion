import { describe, expect, it } from 'vitest';
import { PIECES, SIDE } from './construction';
import type { Ring, Vec } from './construction';
import {
  IDENTITY_POSE,
  area,
  convexOverlap,
  signedArea2,
  transformRing,
} from './geometry';
import type { Pose } from './geometry';
import { SQUARE } from './targets';

/** Deterministic LCG (numerical recipes constants) — no Math.random. */
function makeLcg(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomPose(rand: () => number): Pose {
  return {
    flipped: rand() < 0.5,
    rot: Math.floor(rand() * 4) as 0 | 1 | 2 | 3,
    tx: Math.floor(rand() * 41) - 20,
    ty: Math.floor(rand() * 41) - 20,
  };
}

const unitSquare: Ring = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const translate = (ring: Ring, dx: number, dy: number): Ring =>
  ring.map(([x, y]) => [x + dx, y + dy] as const);

describe('transformRing', () => {
  it('IDENTITY_POSE leaves every piece unchanged', () => {
    for (const piece of PIECES) {
      expect(transformRing(piece.vertices, IDENTITY_POSE)).toEqual(piece.vertices);
    }
  });

  it('keeps vertices integer and preserves area for seeded random poses on every piece', () => {
    const rand = makeLcg(0xc0ffee);
    for (let trial = 0; trial < 25; trial++) {
      const pose = randomPose(rand);
      for (const piece of PIECES) {
        const out = transformRing(piece.vertices, pose);
        for (const [x, y] of out) {
          expect(Number.isInteger(x)).toBe(true);
          expect(Number.isInteger(y)).toBe(true);
        }
        expect(area(out)).toBe(area(piece.vertices));
        expect(out).toHaveLength(piece.vertices.length);
      }
    }
  });

  it('four quarter turns compose to the identity', () => {
    const quarter: Pose = { flipped: false, rot: 1, tx: 0, ty: 0 };
    for (const piece of PIECES) {
      let ring: Ring = piece.vertices;
      for (let i = 0; i < 4; i++) ring = transformRing(ring, quarter);
      expect(ring).toEqual(piece.vertices);
    }
  });

  it('flipping twice composes to the identity', () => {
    const flip: Pose = { flipped: true, rot: 0, tx: 0, ty: 0 };
    for (const piece of PIECES) {
      const twice = transformRing(transformRing(piece.vertices, flip), flip);
      expect(twice).toEqual(piece.vertices);
    }
  });

  it('a flip reverses orientation, a pure rotation preserves it', () => {
    const ring = PIECES[0].vertices;
    const s = signedArea2(ring);
    expect(signedArea2(transformRing(ring, { flipped: true, rot: 0, tx: 0, ty: 0 }))).toBe(-s);
    expect(signedArea2(transformRing(ring, { flipped: false, rot: 1, tx: 3, ty: -2 }))).toBe(s);
  });

  it('applies flip before rotation: v -> rot^k(flip(v)) + t', () => {
    // v = (2,1), flipped -> (-2,1), rot 1 ((x,y) -> (-y,x)) -> (-1,-2), + (5,5) -> (4,3)
    const out = transformRing([[2, 1]], { flipped: true, rot: 1, tx: 5, ty: 5 });
    expect(out).toEqual([[4, 3]]);
  });
});

describe('convexOverlap semantics (open interiors)', () => {
  it('unit squares sharing a full edge do not overlap', () => {
    expect(convexOverlap(unitSquare, translate(unitSquare, 1, 0))).toBe(false);
    expect(convexOverlap(unitSquare, translate(unitSquare, 0, 1))).toBe(false);
  });

  it('squares touching only at a corner do not overlap', () => {
    expect(convexOverlap(unitSquare, translate(unitSquare, 1, 1))).toBe(false);
  });

  it('a ring against itself overlaps', () => {
    expect(convexOverlap(unitSquare, unitSquare)).toBe(true);
    for (const piece of PIECES) {
      expect(convexOverlap(piece.vertices, piece.vertices)).toBe(true);
    }
  });

  it('a 2x2 square shifted by (1,0) overlaps its original interior', () => {
    const big: Ring = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ];
    expect(convexOverlap(big, translate(big, 1, 0))).toBe(true);
  });

  it('far-apart rings do not overlap', () => {
    expect(convexOverlap(unitSquare, translate(unitSquare, 100, 100))).toBe(false);
    expect(
      convexOverlap(
        PIECES[0].vertices,
        transformRing(PIECES[0].vertices, { flipped: false, rot: 0, tx: 50, ty: 0 }),
      ),
    ).toBe(false);
  });

  it('is symmetric in its arguments', () => {
    const a = PIECES[6].vertices;
    const b = translate(PIECES[6].vertices, 1, 0);
    expect(convexOverlap(a, b)).toBe(convexOverlap(b, a));
    expect(convexOverlap(a, b)).toBe(true);
  });

  it('adjacent real pieces in the reference layout do not overlap (edge contact only)', () => {
    // p0 (0,0)-(6,0)-(4,4) and p5 (4,4)-(6,0)-(6,6) share the edge (6,0)-(4,4).
    expect(convexOverlap(PIECES[0].vertices, PIECES[5].vertices)).toBe(false);
    // p0 and p1 touch along the diagonal through (2,2)-(4,4).
    expect(convexOverlap(PIECES[0].vertices, PIECES[1].vertices)).toBe(false);
  });

  it('no pair of reference-placed pieces overlaps', () => {
    for (let i = 0; i < PIECES.length; i++) {
      for (let j = i + 1; j < PIECES.length; j++) {
        expect(convexOverlap(PIECES[i].vertices, PIECES[j].vertices)).toBe(false);
      }
    }
  });

  it('a real piece nudged by (1,0) overlaps its original when the shift is within its width', () => {
    // Every piece except p4 spans more than 1 unit in x, so a (1,0) nudge
    // intrudes into the original interior.
    for (const piece of PIECES) {
      if (piece.id === 'p4') continue;
      expect(convexOverlap(piece.vertices, translate(piece.vertices, 1, 0))).toBe(true);
    }
  });

  it('the 1-unit-wide sliver p4 nudged by exactly (1,0) only touches its original: no overlap', () => {
    // p4 = (2,8)-(3,6)-(3,12) spans x in [2,3]; shifted it spans [3,4], so the
    // two triangles meet along x = 3 with disjoint open interiors.
    const p4 = PIECES[4].vertices;
    expect(convexOverlap(p4, translate(p4, 1, 0))).toBe(false);
  });
});

describe('SQUARE region', () => {
  it('has area 144 and the 12x12 outline', () => {
    expect(SQUARE.area).toBe(144);
    expect(area(SQUARE.outline)).toBe(144);
  });

  it('contains rings on or inside the boundary', () => {
    expect(SQUARE.contains(unitSquare)).toBe(true);
    expect(SQUARE.contains(SQUARE.outline)).toBe(true);
    for (const piece of PIECES) expect(SQUARE.contains(piece.vertices)).toBe(true);
  });

  it('rejects rings with any vertex outside', () => {
    expect(SQUARE.contains(translate(unitSquare, SIDE, 0))).toBe(false);
    expect(SQUARE.contains(translate(unitSquare, 0, -1))).toBe(false);
    expect(SQUARE.contains([[SIDE + 1, 0] as Vec, [0, 0], [1, 1]])).toBe(false);
  });
});
