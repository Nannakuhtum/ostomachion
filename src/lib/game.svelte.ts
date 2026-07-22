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

/** Tray grid below the board: a 5-column shelf that holds all fourteen pieces. */
const TRAY = {
  cols: 5,
  left: WORLD.x + 0.3,
  right: WORLD.x + WORLD.w - 0.3,
  top: SIDE + 0.5,
  bottom: WORLD.y + WORLD.h - 0.3,
};
const TRAY_ROWS = Math.ceil(PIECES.length / TRAY.cols);
const TRAY_CELL_W = (TRAY.right - TRAY.left) / TRAY.cols;
const TRAY_CELL_H = (TRAY.bottom - TRAY.top) / TRAY_ROWS;

/**
 * The one scale every scattered piece shares. Sized from the largest piece —
 * laid landscape (long side horizontal) — against a cell; the fill factor > 1
 * lets bigger pieces spill their cell (mild overlap is fine and legible), with
 * scatterLayout clamping each piece back inside the world. Because landscape
 * dimensions don't depend on the random orientation, this is a constant, and a
 * deselected piece always shrinks back to exactly it.
 */
export const TRAY_SCALE = (() => {
  const long = Math.max(
    ...PIECES.map((p) => {
      const b = ringBBox(p.vertices);
      return Math.max(b.maxX - b.minX, b.maxY - b.minY);
    })
  );
  const short = Math.max(
    ...PIECES.map((p) => {
      const b = ringBBox(p.vertices);
      return Math.min(b.maxX - b.minX, b.maxY - b.minY);
    })
  );
  return Math.min((TRAY_CELL_W * 1.5) / long, (TRAY_CELL_H * 1.5) / short);
})();

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

/**
 * Deterministic-per-seed scatter: the fourteen pieces shrunk to a shared tray
 * scale and laid out in a 5-column grid below the board, so all of them stay
 * visible at once. The scale is truthful — every piece uses the same factor, so
 * their relative sizes read correctly — and is sized to the largest piece's
 * flattest orientation so nothing spills its cell. A piece grows back to full
 * lattice size the moment it is picked up (see `Game.select`). Both the
 * cell each piece lands in and its orientation are seeded, so "Scatter anew"
 * (a fresh random seed) genuinely reshuffles the tray.
 */
export function scatterLayout(seed = 7): Pose[] {
  const rand = mulberry32(seed);

  // Shuffle which cell each piece occupies so the arrangement varies per seed.
  const cellOf = [...Array(PIECES.length).keys()];
  for (let k = cellOf.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1));
    [cellOf[k], cellOf[j]] = [cellOf[j], cellOf[k]];
  }

  return PIECES.map((piece, i) => {
    // Orient landscape (long side horizontal) so pieces pack flat below the board.
    const flipped = rand() < 0.35;
    let rot = (Math.floor(rand() * 4) % 4) as Pose['rot'];
    let b = ringBBox(transformRing(piece.vertices, { flipped, rot, tx: 0, ty: 0 }));
    if (b.maxY - b.minY > b.maxX - b.minX) {
      rot = ((rot + 1) % 4) as Pose['rot'];
      b = ringBBox(transformRing(piece.vertices, { flipped, rot, tx: 0, ty: 0 }));
    }
    const w = b.maxX - b.minX;
    const h = b.maxY - b.minY;
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;

    const col = cellOf[i] % TRAY.cols;
    const row = Math.floor(cellOf[i] / TRAY.cols);
    // Small jitter, bounded by any leftover room; pieces that fill their cell
    // simply center on the grid (jitter 0).
    const jx = Math.max(0, (TRAY_CELL_W - w * TRAY_SCALE) / 2) * 0.6;
    const jy = Math.max(0, (TRAY_CELL_H - h * TRAY_SCALE) / 2) * 0.6;
    const targetCX = TRAY.left + (col + 0.5) * TRAY_CELL_W + (rand() - 0.5) * 2 * jx;
    const targetCY = TRAY.top + (row + 0.5) * TRAY_CELL_H + (rand() - 0.5) * 2 * jy;
    // Scaling is about the origin, so the scaled center sits at scale·center.
    let tx = targetCX - cx * TRAY_SCALE;
    let ty = targetCY - cy * TRAY_SCALE;
    // Keep the scaled bounds off the board and inside the world (edge-column
    // pieces get nudged in, which is where the acceptable overlap happens).
    const minX = b.minX * TRAY_SCALE + tx;
    if (minX < WORLD.x + 0.2) tx += WORLD.x + 0.2 - minX;
    const maxX = b.maxX * TRAY_SCALE + tx;
    if (maxX > WORLD.x + WORLD.w - 0.2) tx -= maxX - (WORLD.x + WORLD.w - 0.2);
    const minY = b.minY * TRAY_SCALE + ty;
    if (minY < SIDE + 0.2) ty += SIDE + 0.2 - minY;
    const maxY = b.maxY * TRAY_SCALE + ty;
    if (maxY > WORLD.y + WORLD.h - 0.2) ty -= maxY - (WORLD.y + WORLD.h - 0.2);
    return { flipped, rot, tx, ty, scale: TRAY_SCALE };
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

  /** True when the piece's center sits over the 12×12 board (not the tray). */
  onBoard(i: number): boolean {
    const [cx, cy] = ringCenter(this.ringOf(i));
    return cx >= 0 && cx <= SIDE && cy >= 0 && cy <= SIDE;
  }

  /**
   * Change a piece's scale about its own center (position held fixed): grow a
   * tray piece to full lattice size when it comes into play, shrink it back
   * when it returns to rest in the tray. Scale exactly 1 drops the field so
   * board pieces stay literally full size for the rules.
   */
  private rescale(i: number, scale: number) {
    const p = this.placements[i];
    if ((p.scale ?? 1) === scale) return;
    const [c0x, c0y] = ringCenter(this.ringOf(i));
    const next: Pose = scale === 1 ? { flipped: p.flipped, rot: p.rot, tx: p.tx, ty: p.ty } : { ...p, scale };
    const [c1x, c1y] = ringCenter(transformRing(PIECES[i].vertices, next));
    next.tx += c0x - c1x;
    next.ty += c0y - c1y;
    this.placements[i] = this.clamped(next, i);
  }

  select(i: number | null) {
    const prev = this.selected;
    this.selected = i;
    // The piece leaving play shrinks back into the tray; the one entering play
    // grows to true size so it can be read, rotated, and placed on the lattice.
    if (prev != null && prev !== i && !this.onBoard(prev)) this.rescale(prev, TRAY_SCALE);
    if (i != null && !this.onBoard(i)) this.rescale(i, 1);
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
    // Resize first (center held): on the board a piece is exactly full size for
    // the rules; back in the tray it shrinks the moment it is dropped, not on
    // some later deselect. Then snap the resized piece so lattice alignment
    // measures the full-size outline.
    this.rescale(i, this.onBoard(i) ? 1 : TRAY_SCALE);
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
    // Fresh random seed each time, so "Scatter anew" actually rearranges.
    this.placements = scatterLayout(Math.floor(Math.random() * 0x7fffffff));
    this.selected = null;
    this.win = null;
    saveLayout(this.placements);
  }
}

export const game = new Game();

export function worldCenterOf(ring: Ring): Vec {
  return ringCenter(ring);
}
