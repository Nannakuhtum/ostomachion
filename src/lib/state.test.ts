import { describe, expect, it } from 'vitest';
import { ui } from './state.svelte';

describe('state', () => {
  it('defaults to the play view', () => {
    expect(ui.view).toBe('play');
  });
});
