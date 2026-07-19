import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Board from './Board.svelte';
import { WORLD } from './game.svelte';

describe('Board', () => {
  it('renders the game world SVG containing the 12×12 board with a scatter margin', () => {
    const { container } = render(Board);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('viewBox')).toBe(`${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}`);
    expect(WORLD.x).toBeLessThanOrEqual(0);
    expect(WORLD.x + WORLD.w).toBeGreaterThanOrEqual(12);
    expect(WORLD.y).toBeLessThanOrEqual(0);
    expect(WORLD.y + WORLD.h).toBeGreaterThanOrEqual(12);
  });

  it('has an accessible label and renders all 14 pieces', () => {
    const { container } = render(Board);
    const svg = container.querySelector('svg');
    expect(svg!.getAttribute('aria-label')).toMatch(/board/i);
    expect(container.querySelectorAll('[data-index]')).toHaveLength(14);
  });
});
