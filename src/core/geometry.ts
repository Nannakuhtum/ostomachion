import type { Ring, Vec } from './construction';

/**
 * A piece placement. `tx`/`ty` are integers whenever a piece sits on the
 * lattice (anything the rules evaluate); floating scatter positions may be
 * fractional and simply fail containment. `rot` counts quarter turns.
 * Flip is applied before rotation: v → rot(scale·flip(v)) + t.
 *
 * `scale` (default 1) shrinks a piece for the tray below the board so all
 * fourteen stay visible; a piece is grown back to 1 — true lattice size —
 * whenever it is picked up or resting on the board, which is the only state
 * the rules ever evaluate.
 */
export interface Pose {
  flipped: boolean;
  rot: 0 | 1 | 2 | 3;
  tx: number;
  ty: number;
  scale?: number;
}

export const IDENTITY_POSE: Pose = { flipped: false, rot: 0, tx: 0, ty: 0 };

export function transformRing(vertices: Ring, pose: Pose): Vec[] {
  const s = pose.scale ?? 1;
  return vertices.map(([x, y]) => {
    let vx = (pose.flipped ? -x : x) * s;
    let vy = y * s;
    for (let i = 0; i < pose.rot; i++) {
      const t = vx;
      vx = -vy;
      vy = t;
    }
    return [vx + pose.tx, vy + pose.ty] as const;
  }) as Vec[];
}

/** Twice the signed area (integer for lattice rings). Positive = clockwise in y-down coords. */
export function signedArea2(ring: Ring): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    s += x1 * y2 - x2 * y1;
  }
  return s;
}

export function area(ring: Ring): number {
  return Math.abs(signedArea2(ring)) / 2;
}

function axes(ring: Ring): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    out.push([y2 - y1, x1 - x2]); // normal of the edge
  }
  return out;
}

function project(ring: Ring, [ax, ay]: Vec): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const [x, y] of ring) {
    const d = x * ax + y * ay;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return [min, max];
}

/**
 * True when two convex rings have intersecting interiors. Separating-axis
 * test with closed comparisons, so shared edges and vertices (max === min)
 * do NOT count as overlap — tilings require pieces to touch.
 */
export function convexOverlap(a: Ring, b: Ring): boolean {
  for (const axis of [...axes(a), ...axes(b)]) {
    const [minA, maxA] = project(a, axis);
    const [minB, maxB] = project(b, axis);
    if (maxA <= minB || maxB <= minA) return false;
  }
  return true;
}

export function ringBBox(ring: Ring): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

export function ringCenter(ring: Ring): Vec {
  const b = ringBBox(ring);
  return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
}

/** Quarter-turn of a ring about a point (y-down: positive = clockwise on screen). */
export function rotateRingQuarterAbout(ring: Ring, [cx, cy]: Vec): Vec[] {
  return ring.map(([x, y]) => [cx - (y - cy), cy + (x - cx)] as const) as Vec[];
}

/** Mirror a ring about the vertical axis through a point. */
export function mirrorRingAbout(ring: Ring, [cx]: Vec): Vec[] {
  return ring.map(([x, y]) => [2 * cx - x, y] as const) as Vec[];
}

const EPS = 1e-6;

/**
 * Recover the pose that carries `base` exactly onto `target` (same vertex
 * order, as produced by transforming a ring vertex-by-vertex). The uniform
 * scale is read back from the area ratio, so tray-scaled rings round-trip
 * through rotate/flip too. A scale within EPS of 1 is dropped so board pieces
 * stay exactly full size. Returns null if no flip/rotation/translation matches.
 */
export function poseForRing(base: Ring, target: Ring): Pose | null {
  const s = Math.sqrt(area(target) / area(base));
  for (const flipped of [false, true]) {
    for (const rot of [0, 1, 2, 3] as const) {
      const c = transformRing(base, { flipped, rot, tx: 0, ty: 0, scale: s });
      const tx = target[0][0] - c[0][0];
      const ty = target[0][1] - c[0][1];
      if (c.every(([x, y], i) => Math.abs(x + tx - target[i][0]) < EPS && Math.abs(y + ty - target[i][1]) < EPS)) {
        return Math.abs(s - 1) < EPS ? { flipped, rot, tx, ty } : { flipped, rot, tx, ty, scale: s };
      }
    }
  }
  return null;
}

/** A target region every mode plays against. */
export interface Region {
  /** Area in lattice units. */
  area: number;
  /** Exact: true when the ring lies entirely inside (boundary allowed). */
  contains(ring: Ring): boolean;
  /** The region outline, for rendering. */
  outline: Ring;
}
