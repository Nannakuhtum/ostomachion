import { beforeEach, describe, expect, it } from 'vitest';
import { PIECES, SIDE } from '../core/construction';
import type { Pose } from '../core/geometry';
import { IDENTITY_POSE, convexOverlap, ringBBox, transformRing } from '../core/geometry';
import { WORLD, game, scatterLayout } from './game.svelte';
import { loadLayout, loadSolutions } from './persist';

const LAYOUT_KEY = 'ostomachion.classic.layout';

/** The reference solution: every piece at its constructed position. */
function referenceSolution(): Pose[] {
  return PIECES.map(() => ({ ...IDENTITY_POSE }));
}

function plain(poses: readonly Pose[]): Pose[] {
  return poses.map((p) => ({ flipped: p.flipped, rot: p.rot, tx: p.tx, ty: p.ty }));
}

beforeEach(() => {
  localStorage.clear();
  game.reset();
  game.solutionCount = 0;
  game.select(null);
});

describe('scatterLayout', () => {
  it('is deterministic for the same seed', () => {
    expect(scatterLayout(42)).toEqual(scatterLayout(42));
    expect(scatterLayout()).toEqual(scatterLayout(7));
  });

  it('produces a pose for each of the 14 pieces', () => {
    expect(scatterLayout()).toHaveLength(14);
    expect(PIECES).toHaveLength(14);
  });

  it.each([7, 1, 2, 42])('seed %i: keeps every piece off the board and inside the world', (seed) => {
    const layout = scatterLayout(seed);
    layout.forEach((pose, i) => {
      const b = ringBBox(transformRing(PIECES[i].vertices, pose));
      // Entirely below the board: no ring intersects the 12x12 interior.
      expect(b.minY).toBeGreaterThanOrEqual(SIDE);
      // Inside the world extents.
      expect(b.minX).toBeGreaterThanOrEqual(WORLD.x);
      expect(b.maxX).toBeLessThanOrEqual(WORLD.x + WORLD.w);
      expect(b.minY).toBeGreaterThanOrEqual(WORLD.y);
      expect(b.maxY).toBeLessThanOrEqual(WORLD.y + WORLD.h);
    });
  });
});

describe('settle snapping', () => {
  it('snaps a fractional pose to integer translation when the piece is near the board', () => {
    game.placements[0] = { flipped: false, rot: 0, tx: 3.3, ty: 2.2 };
    // Premise: the rounded bbox overlaps the board neighborhood.
    const b = ringBBox(transformRing(PIECES[0].vertices, { flipped: false, rot: 0, tx: 3, ty: 2 }));
    expect(b.minY).toBeLessThan(SIDE + 1);

    game.settle(0);
    expect(game.placements[0]).toEqual({ flipped: false, rot: 0, tx: 3, ty: 2 });
  });

  it('leaves a fractional pose untouched when dropped in the scatter zone', () => {
    const pose: Pose = { flipped: false, rot: 0, tx: 1.4, ty: 14.6 };
    game.placements[0] = { ...pose };
    // Premise: even after rounding, the bbox sits fully below board + 1.
    const b = ringBBox(transformRing(PIECES[0].vertices, { ...pose, tx: 1, ty: 15 }));
    expect(b.minY).toBeGreaterThanOrEqual(SIDE + 1);

    game.settle(0);
    expect(game.placements[0]).toEqual(pose);
  });

  it('preserves rot and flip through a snap', () => {
    game.placements[0] = { flipped: true, rot: 3, tx: 4.9, ty: 3.1 };
    game.settle(0);
    expect(game.placements[0]).toEqual({ flipped: true, rot: 3, tx: 5, ty: 3 });
  });
});

describe('overlap permitted', () => {
  it('accepts overlapping placements without moving or rejecting either piece', () => {
    const poses = referenceSolution();
    poses[0] = { flipped: false, rot: 0, tx: 1, ty: 1 };
    game.placements = poses;
    // Premise: pieces 0 and 5 genuinely overlap.
    expect(convexOverlap(game.ringOf(0), game.ringOf(5))).toBe(true);

    game.settle(0);
    game.settle(5);
    expect(game.placements[0]).toEqual({ flipped: false, rot: 0, tx: 1, ty: 1 });
    expect(game.placements[5]).toEqual(IDENTITY_POSE);
    expect(game.win).toBeNull();
  });

  it('accepts two pieces settled at identical poses', () => {
    const pose: Pose = { flipped: false, rot: 0, tx: 2, ty: 2 };
    game.placements[0] = { ...pose };
    game.placements[1] = { ...pose };
    game.settle(0);
    game.settle(1);
    expect(game.placements[0]).toEqual(pose);
    expect(game.placements[1]).toEqual(pose);
  });
});

describe('winning', () => {
  it('triggers a new win on the final settle and records the solution', () => {
    const poses = referenceSolution();
    poses[3] = { ...IDENTITY_POSE, tx: 2, ty: 16 }; // last piece still in the scatter zone
    game.placements = poses;
    expect(game.win).toBeNull();

    game.moveBy(3, -2, -16);
    game.settle(3);

    expect(game.win).toEqual({ kind: 'new', total: 1 });
    expect(game.solutionCount).toBe(1);

    const stored = loadSolutions();
    expect(stored).toHaveLength(1);
    expect(typeof stored[0].signature).toBe('string');
    expect(stored[0].signature.length).toBeGreaterThan(0);
    expect(stored[0].placements).toEqual(referenceSolution());
    expect(typeof stored[0].foundAt).toBe('number');
  });

  it('acknowledges a repeat solution without storing a duplicate', () => {
    game.placements = referenceSolution();
    game.moveBy(3, 0, 16);
    game.settle(3); // nudge away: no longer a win
    expect(game.win).toBeNull();
    game.moveBy(3, 0, -16);
    game.settle(3); // first completion
    expect(game.win).toEqual({ kind: 'new', total: 1 });

    game.moveBy(3, 0, 16);
    game.settle(3);
    expect(game.win).toBeNull();
    game.moveBy(3, 0, -16);
    game.settle(3); // same tiling again

    expect(game.win).toEqual({ kind: 'repeat', total: 1 });
    expect(game.solutionCount).toBe(1);
    expect(loadSolutions()).toHaveLength(1);
  });

  it('computes wins from logical poses via the game API only', () => {
    // Directly assigning a solved layout does not win; only settle evaluates rules.
    game.placements = referenceSolution();
    expect(game.win).toBeNull();
    game.settle(0);
    expect(game.win).not.toBeNull();
  });
});

describe('rotate and flip commit lattice-exact poses', () => {
  it('rotateQuarter near the board yields an integer translation', () => {
    game.placements[0] = { ...IDENTITY_POSE, tx: 3, ty: 2 };
    game.rotateQuarter(0);
    const p = game.placements[0];
    expect(p.rot).toBe(1);
    expect(Number.isInteger(p.tx)).toBe(true);
    expect(Number.isInteger(p.ty)).toBe(true);
  });

  it('flip twice restores the original ring', () => {
    game.placements[0] = { ...IDENTITY_POSE, tx: 3, ty: 2 };
    const before = game.ringOf(0);
    game.flip(0);
    expect(game.placements[0].flipped).toBe(true);
    game.flip(0);
    expect(game.ringOf(0)).toEqual(before);
  });
});

describe('layout persistence through the game', () => {
  it('persists the arrangement on every settle, including floating positions', () => {
    game.placements[0] = { flipped: false, rot: 1, tx: 4.5, ty: 15.5 };
    game.settle(0);
    expect(loadLayout()).toEqual(plain(game.placements));

    game.placements[1] = { flipped: false, rot: 0, tx: 2.4, ty: 3.4 };
    game.settle(1);
    expect(loadLayout()).toEqual(plain(game.placements));
    expect(loadLayout()![1]).toEqual({ flipped: false, rot: 0, tx: 2, ty: 3 });
  });

  it('persists under the versioned layout key', () => {
    game.settle(0);
    const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY)!);
    expect(raw.v).toBe(1);
    expect(raw.layout).toHaveLength(14);
  });
});

describe('fresh start', () => {
  it('reset scatters all 14 pieces off the board with no win', () => {
    localStorage.clear();
    game.reset();

    expect(game.win).toBeNull();
    expect(game.selected).toBeNull();
    expect(game.placements).toHaveLength(14);
    for (let i = 0; i < 14; i++) {
      expect(ringBBox(game.ringOf(i)).minY).toBeGreaterThanOrEqual(SIDE);
    }
    // The fresh scatter is itself persisted for resume.
    expect(loadLayout()).toEqual(plain(game.placements));
  });
});
