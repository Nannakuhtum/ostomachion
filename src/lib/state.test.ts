import { describe, expect, it } from 'vitest';
import { MODES, MODE_LABELS, ui } from './state.svelte';

describe('state', () => {
  it('exposes the three modes in order', () => {
    expect(MODES).toEqual(['classic', 'figures', 'collection']);
  });

  it('maps each mode to a display label', () => {
    expect(MODE_LABELS).toEqual({
      classic: 'Classic',
      figures: 'Figures',
      collection: 'Collection',
    });
  });

  it('defaults to classic mode', () => {
    expect(ui.mode).toBe('classic');
  });
});
