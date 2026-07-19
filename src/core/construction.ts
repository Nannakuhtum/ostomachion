/**
 * The Suter dissection of the 12×12 square, derived by construction.
 *
 * Line set decoded from the public-domain figure "Ostomachion (after Suter)"
 * (Wikimedia Commons, Hagen von Eitzen, 2007; 1/12 grid), cross-checked
 * against the piece-area list 2×3, 4×6, 1×9, 5×12, 1×21, 1×24 (MathWorld,
 * "Stomachion"). Coordinates are y-down to match SVG rendering.
 *
 * Every named point is produced by midpoint/intersection operations in exact
 * rational arithmetic; the invariant tests assert integrality, convexity,
 * the area multiset, and that the reference layout tiles the square.
 */

export type Vec = readonly [number, number];
export type Ring = readonly Vec[];

interface Rat {
  n: number;
  d: number; // always > 0
}

const rat = (n: number, d = 1): Rat => {
  if (d === 0) throw new Error('rational with zero denominator');
  const s = d < 0 ? -1 : 1;
  return { n: s * n, d: s * d };
};

type RPoint = readonly [Rat, Rat];

const rp = (x: number, y: number): RPoint => [rat(x), rat(y)];

const add = (a: Rat, b: Rat): Rat => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Rat, b: Rat): Rat => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d);
const div = (a: Rat, b: Rat): Rat => rat(a.n * b.d, a.d * b.n);
const isZero = (a: Rat): boolean => a.n === 0;

function midpoint(p: RPoint, q: RPoint): RPoint {
  const half = rat(1, 2);
  return [mul(add(p[0], q[0]), half), mul(add(p[1], q[1]), half)];
}

/** Intersection of the infinite lines PQ and RS (must not be parallel). */
function intersect(p: RPoint, q: RPoint, r: RPoint, s: RPoint): RPoint {
  const dx1 = sub(q[0], p[0]);
  const dy1 = sub(q[1], p[1]);
  const dx2 = sub(s[0], r[0]);
  const dy2 = sub(s[1], r[1]);
  const denom = sub(mul(dx1, dy2), mul(dy1, dx2));
  if (isZero(denom)) throw new Error('parallel lines in construction');
  const ex = sub(r[0], p[0]);
  const ey = sub(r[1], p[1]);
  const t = div(sub(mul(ex, dy2), mul(ey, dx2)), denom);
  return [add(p[0], mul(t, dx1)), add(p[1], mul(t, dy1))];
}

function toLattice(p: RPoint): Vec {
  const gx = p[0];
  const gy = p[1];
  if (gx.n % gx.d !== 0 || gy.n % gy.d !== 0) {
    throw new Error(`construction point is not a lattice point: ${gx.n}/${gx.d}, ${gy.n}/${gy.d}`);
  }
  return [gx.n / gx.d, gy.n / gy.d];
}

// ---- The construction ------------------------------------------------------

export const SIDE = 12;

// Square corners (y-down): A top-left, B top-right, C bottom-right, D bottom-left.
const A = rp(0, 0);
const B = rp(SIDE, 0);
const C = rp(SIDE, SIDE);
const D = rp(0, SIDE);

const M = midpoint(A, B); // (6,0)  top-edge midpoint
const N = midpoint(D, C); // (6,12) bottom-edge midpoint
const H = midpoint(B, C); // (12,6) right-edge midpoint
const P = midpoint(D, N); // (3,12)
const G = intersect(A, C, D, M); // (4,4)  diagonal ∩ DM
const E = midpoint(A, G); // (2,2)
const F = midpoint(D, M); // (3,6)
const Q = intersect(D, M, A, P); // (2,8)  DM ∩ line A→P
const O = intersect(A, C, M, N); // (6,6)  diagonal ∩ midline
const T = midpoint(M, C); // (9,6)
const R = intersect(A, C, N, T); // (8,8)  diagonal ∩ NT
const Z = intersect(D, T, B, C); // (12,4) line D→T ∩ right edge

const faces: readonly (readonly RPoint[])[] = [
  [A, M, G], //             triangle, area 12
  [E, G, D], //             triangle, area 12 (edge G–D runs along DM through Q)
  [A, E, D], //             triangle, area 12
  [D, Q, P], //             triangle, area 6
  [Q, F, P], //             triangle, area 3
  [G, M, O], //             triangle, area 6   (congruent with [O, N, R])
  [F, G, O, N, P], //       pentagon, area 21
  [M, B, Z, T], //          quadrilateral, area 24
  [Z, H, T], //             triangle, area 3
  [H, C, T], //             triangle, area 9
  [M, O, R, T], //          quadrilateral, area 12
  [R, C, T], //             triangle, area 6
  [O, N, R], //             triangle, area 6   (congruent with [G, M, O])
  [N, C, R], //             triangle, area 12  (congruent with [A, M, G])
];

export interface PieceDef {
  /** Stable id, p0..p13 in construction order. */
  id: string;
  /** Vertex ring on the 12×12 lattice, as constructed (reference placement). */
  vertices: Ring;
}

export const PIECES: readonly PieceDef[] = faces.map((f, i) => ({
  id: `p${i}`,
  vertices: f.map(toLattice),
}));
