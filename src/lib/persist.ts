import type { Pose } from '../core/geometry';

const LAYOUT_KEY = 'ostomachion.classic.layout';
const SOLUTIONS_KEY = 'ostomachion.solutions';

export interface StoredSolution {
  signature: string;
  placements: Pose[];
  foundAt: number;
}

interface LayoutEnvelope {
  v: 1;
  layout: Pose[];
}

interface SolutionsEnvelope {
  v: 1;
  solutions: StoredSolution[];
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable: play continues without persistence
  }
}

export function loadLayout(): Pose[] | null {
  const env = read<LayoutEnvelope>(LAYOUT_KEY);
  return env?.v === 1 && Array.isArray(env.layout) && env.layout.length === 14 ? env.layout : null;
}

export function saveLayout(layout: readonly Pose[]): void {
  write(LAYOUT_KEY, { v: 1, layout: [...layout] } satisfies LayoutEnvelope);
}

export function loadSolutions(): StoredSolution[] {
  const env = read<SolutionsEnvelope>(SOLUTIONS_KEY);
  return env?.v === 1 && Array.isArray(env.solutions) ? env.solutions : [];
}

/** Returns true when the solution was new and stored. */
export function recordSolution(signature: string, placements: readonly Pose[], foundAt: number): boolean {
  const solutions = loadSolutions();
  if (solutions.some((s) => s.signature === signature)) return false;
  solutions.push({ signature, placements: [...placements], foundAt });
  write(SOLUTIONS_KEY, { v: 1, solutions } satisfies SolutionsEnvelope);
  return true;
}
