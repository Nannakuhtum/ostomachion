import { PIECES, SIDE } from '../core/construction';
import type { Ring, Vec } from '../core/construction';
import type { Pose } from '../core/geometry';
import {
  mirrorRingAbout,
  poseForRing,
  ringBBox,
  ringCenter,
  rotateRingQuarterAbout,
  transformRing,
} from '../core/geometry';
import { isWin } from '../core/rules';
import { signature } from '../core/canonical';
import { SQUARE } from '../core/targets';
import { loadLayout, loadSolutions, recordSolution, saveLayout } from './persist';

/** World extents: board at 0..12 with slim side padding, scatter zone below. */
export const WORLD = { x: -0.75, y: -0.5, w: 13.5, h: 19.5 };

export type WinKind = 'new' | 'repeat';

/**
 * One-shot spin continuity handoff: on knob release, Board records the
 * residual angle (release angle minus the committed quarter turns) so the
 * piece's settle animation starts exactly where the user let go and travels
 * in the direction they were rotating. Keyed by piece index; consumed by
 * Piece on the next pose effect.
 */
export const pendingSpin = new Map<number, number>();

/** Deterministic scatter: loose grid of slots below the board, seeded jitter. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function scatterLayout(seed = 7): Pose[] {
  const rand = mulberry32(seed);
  const cols = 5;
  const slotW = (WORLD.w - 1) / cols;
  return PIECES.map((piece, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    let rot = (Math.floor(rand() * 4) % 4) as Pose['rot'];
    const flipped = rand() < 0.35;
    // Lay tall pieces flat so the scatter zone stays below the board.
    let posed = transformRing(piece.vertices, { flipped, rot, tx: 0, ty: 0 });
    let b = ringBBox(posed);
    if (b.maxY - b.minY > b.maxX - b.minX) {
      rot = ((rot + 1) % 4) as Pose['rot'];
      posed = transformRing(piece.vertices, { flipped, rot, tx: 0, ty: 0 });
      b = ringBBox(posed);
    }
    const [cx, cy] = ringCenter(posed);
    const slotX = WORLD.x + 0.5 + (col + 0.5) * slotW + (rand() - 0.5) * 1.2;
    const slotY = SIDE + 1.8 + row * 2.5 + (rand() - 0.5) * 0.8;
    let tx = slotX - cx;
    let ty = slotY - cy;
    // Keep off the board and inside the world.
    const minY = b.minY + ty;
    if (minY < SIDE + 0.4) ty += SIDE + 0.4 - minY;
    const maxY = b.maxY + ty;
    if (maxY > WORLD.y + WORLD.h - 0.2) ty -= maxY - (WORLD.y + WORLD.h - 0.2);
    const minX = b.minX + tx;
    if (minX < WORLD.x + 0.2) tx += WORLD.x + 0.2 - minX;
    const maxX = b.maxX + tx;
    if (maxX > WORLD.x + WORLD.w - 0.2) tx -= maxX - (WORLD.x + WORLD.w - 0.2);
    return { flipped, rot, tx, ty };
  });
}

class Game {
  placements = $state<Pose[]>(loadLayout() ?? scatterLayout());
  selected = $state<number | null>(null);
  dragging = $state<number | null>(null);
  win = $state<{ kind: WinKind; total: number } | null>(null);
  solutionCount = $state(loadSolutions().length);

  constructor() {
    // A restored layout may have drifted out of the world (older builds allowed it).
    this.placements = this.placements.map((p, i) => this.clamped(p, i));
    // A restored layout may already be solved; reflect it (quietly, as a repeat).
    if (isWin(this.placements, SQUARE)) {
      this.win = { kind: 'repeat', total: this.solutionCount };
    }
  }

  ringOf(i: number): Ring {
    return transformRing(PIECES[i].vertices, this.placements[i]);
  }

  select(i: number | null) {
    this.selected = i;
  }

  /** Keep the piece's bounds inside the world so it can always be grabbed again. */
  private clamped(pose: Pose, i: number): Pose {
    const b = ringBBox(transformRing(PIECES[i].vertices, pose));
    const m = 0.2;
    let dx = 0;
    let dy = 0;
    if (b.minX < WORLD.x + m) dx = WORLD.x + m - b.minX;
    else if (b.maxX > WORLD.x + WORLD.w - m) dx = WORLD.x + WORLD.w - m - b.maxX;
    if (b.minY < WORLD.y + m) dy = WORLD.y + m - b.minY;
    else if (b.maxY > WORLD.y + WORLD.h - m) dy = WORLD.y + WORLD.h - m - b.maxY;
    return dx || dy ? { ...pose, tx: pose.tx + dx, ty: pose.ty + dy } : pose;
  }

  /** Translate during drag (visual layer springs after this). */
  moveBy(i: number, dx: number, dy: number) {
    const p = this.placements[i];
    this.placements[i] = this.clamped({ ...p, tx: p.tx + dx, ty: p.ty + dy }, i);
  }

  /** Snap near the board: integer translation when the piece touches the board neighborhood. */
  private snapped(pose: Pose, i: number): Pose {
    const ring = transformRing(PIECES[i].vertices, { ...pose, tx: Math.round(pose.tx), ty: Math.round(pose.ty) });
    const b = ringBBox(ring);
    const nearBoard = b.maxX > -1 && b.minX < SIDE + 1 && b.maxY > -1 && b.minY < SIDE + 1;
    return nearBoard ? { ...pose, tx: Math.round(pose.tx), ty: Math.round(pose.ty) } : pose;
  }

  /** Commit the current (possibly fractional) pose at drag end. */
  settle(i: number) {
    this.placements[i] = this.clamped(this.snapped(this.placements[i], i), i);
    this.afterSettle();
  }

  /** Commit a target ring (rotate/flip paths); pose recovered exactly. */
  commitRing(i: number, target: Ring) {
    const pose = poseForRing(PIECES[i].vertices, target);
    if (!pose) return;
    this.placements[i] = this.clamped(this.snapped(pose, i), i);
    this.afterSettle();
  }

  rotateQuarter(i: number) {
    this.commitRing(i, rotateRingQuarterAbout(this.ringOf(i), ringCenter(this.ringOf(i))));
  }

  flip(i: number) {
    this.commitRing(i, mirrorRingAbout(this.ringOf(i), ringCenter(this.ringOf(i))));
  }

  private afterSettle() {
    saveLayout(this.placements);
    if (isWin(this.placements, SQUARE)) {
      const sig = signature(this.placements);
      const isNew = recordSolution(sig, this.placements, Date.now());
      this.solutionCount = loadSolutions().length;
      this.win = { kind: isNew ? 'new' : 'repeat', total: this.solutionCount };
    } else {
      this.win = null;
    }
  }

  reset() {
    this.placements = scatterLayout();
    this.selected = null;
    this.win = null;
    saveLayout(this.placements);
  }
}

export const game = new Game();

export function worldCenterOf(ring: Ring): Vec {
  return ringCenter(ring);
}
