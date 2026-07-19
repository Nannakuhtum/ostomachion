import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Board from './Board.svelte';

describe('Board', () => {
  it('renders an SVG with viewBox 0 0 12 12', () => {
    const { container } = render(Board);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 12 12');
  });

  it('is labelled as an image for assistive tech', () => {
    const { getByRole } = render(Board);
    const svg = getByRole('img');
    expect(svg.getAttribute('aria-label')).toContain('Puzzle board');
  });
});
