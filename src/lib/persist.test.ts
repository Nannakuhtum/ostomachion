import { beforeEach, describe, expect, it } from 'vitest';
import type { Pose } from '../core/geometry';
import { loadLayout, loadSolutions, recordSolution, saveLayout } from './persist';

const LAYOUT_KEY = 'ostomachion.classic.layout';
const SOLUTIONS_KEY = 'ostomachion.solutions';

/** 14 poses mixing lattice and floating (fractional) translations. */
function layout14(): Pose[] {
  return Array.from({ length: 14 }, (_, i) => ({
    flipped: i % 2 === 0,
    rot: (i % 4) as Pose['rot'],
    tx: i % 3 === 0 ? i + 0.25 : i,
    ty: i % 3 === 0 ? 14.5 - i : 14 - i,
  }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('layout persistence', () => {
  it('round-trips a saved layout exactly, including fractional scatter positions', () => {
    const layout = layout14();
    saveLayout(layout);
    expect(loadLayout()).toEqual(layout);
  });

  it('stores the layout under a versioned v:2 envelope', () => {
    const layout = layout14();
    saveLayout(layout);
    const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY)!);
    expect(raw.v).toBe(2);
    expect(raw.layout).toEqual(layout);
  });

  it('returns null when no layout is stored', () => {
    expect(loadLayout()).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    localStorage.setItem(LAYOUT_KEY, '{not valid json');
    expect(loadLayout()).toBeNull();
  });

  it('returns null for a layout with the wrong length', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ v: 2, layout: layout14().slice(0, 5) }));
    expect(loadLayout()).toBeNull();
  });

  it('returns null for a stale v:1 (full-size scatter) layout', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ v: 1, layout: layout14() }));
    expect(loadLayout()).toBeNull();
  });

  it('returns null for an unknown envelope version', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ v: 3, layout: layout14() }));
    expect(loadLayout()).toBeNull();
  });

  it('returns null for a bare array without an envelope', () => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout14()));
    expect(loadLayout()).toBeNull();
  });
});

describe('solution recording', () => {
  it('returns an empty list when nothing is stored or the key is corrupted', () => {
    expect(loadSolutions()).toEqual([]);
    localStorage.setItem(SOLUTIONS_KEY, 'garbage{');
    expect(loadSolutions()).toEqual([]);
  });

  it('stores a new solution with signature, placements, and timestamp under a v:1 envelope', () => {
    const placements = layout14();
    expect(recordSolution('sig-a', placements, 1234)).toBe(true);

    const raw = JSON.parse(localStorage.getItem(SOLUTIONS_KEY)!);
    expect(raw.v).toBe(1);
    expect(raw.solutions).toHaveLength(1);
    expect(raw.solutions[0]).toEqual({ signature: 'sig-a', placements, foundAt: 1234 });

    const loaded = loadSolutions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].signature).toBe('sig-a');
    expect(loaded[0].placements).toEqual(placements);
    expect(loaded[0].foundAt).toBe(1234);
  });

  it('deduplicates by signature: returns false and stores no duplicate entry', () => {
    const placements = layout14();
    expect(recordSolution('sig-a', placements, 1000)).toBe(true);
    expect(recordSolution('sig-a', placements, 2000)).toBe(false);

    const loaded = loadSolutions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].foundAt).toBe(1000);
  });

  it('accumulates distinct signatures', () => {
    const placements = layout14();
    expect(recordSolution('sig-a', placements, 1)).toBe(true);
    expect(recordSolution('sig-b', placements, 2)).toBe(true);
    expect(loadSolutions().map((s) => s.signature)).toEqual(['sig-a', 'sig-b']);
  });
});
