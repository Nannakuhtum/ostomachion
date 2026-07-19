import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import App from './App.svelte';
import { ui } from './lib/state.svelte';

beforeEach(() => {
  ui.mode = 'classic';
});

describe('App', () => {
  it('renders the Ostomachion heading', () => {
    render(App);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent?.trim()).toBe('Ostomachion');
  });

  it('wires the tabpanel to the active tab', () => {
    render(App);
    const panel = screen.getByRole('tabpanel');
    expect(panel.id).toBe('panel-classic');
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-classic');
  });

  it('shows the classic caption by default', () => {
    render(App);
    expect(screen.getByText('Tile the square with all fourteen pieces.')).toBeTruthy();
  });

  it('updates the caption and panel wiring when the mode changes', async () => {
    render(App);
    await fireEvent.click(screen.getByRole('tab', { name: 'Figures' }));
    expect(screen.getByText('Tile a figure from history. Coming soon.')).toBeTruthy();
    const panel = screen.getByRole('tabpanel');
    expect(panel.id).toBe('panel-figures');
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-figures');

    await fireEvent.click(screen.getByRole('tab', { name: 'Collection' }));
    expect(screen.getByText('Every solution you find, kept. Coming soon.')).toBeTruthy();
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('tab-collection');
  });

  it('renders the board inside the tabpanel', () => {
    render(App);
    const panel = screen.getByRole('tabpanel');
    expect(panel.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 12 12');
  });

  it('shows the footer attribution', () => {
    render(App);
    expect(screen.getByText('After the puzzle of Archimedes, c. 250 BC.')).toBeTruthy();
  });
});
