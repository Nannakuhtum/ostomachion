import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import App from './App.svelte';
import { ui } from './lib/state.svelte';

beforeEach(() => {
  ui.view = 'play';
  localStorage.clear();
});

describe('App', () => {
  it('renders the Ostomachion heading', () => {
    render(App);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent?.trim()).toBe('Ostomachion');
  });

  it('shows the classic caption by default', () => {
    render(App);
    expect(screen.getByText('Tile the square with all fourteen pieces.')).toBeTruthy();
  });

  it('shows the collection counter as the corner control', () => {
    render(App);
    const counter = screen.getByRole('button', { name: /Collection: \d+ of 536/ });
    expect(counter.textContent).toContain('536');
  });

  it('opens the collection from the counter and returns via the corner control', async () => {
    render(App);
    await fireEvent.click(screen.getByRole('button', { name: /Collection: \d+ of 536/ }));
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/of 536 solutions/);
    expect(screen.getByText('Solve the square to begin your collection.')).toBeTruthy();
    expect(document.querySelector('[data-index]')).toBeNull();

    await fireEvent.click(screen.getByRole('button', { name: /Board/ }));
    expect(screen.getByText('Tile the square with all fourteen pieces.')).toBeTruthy();
  });

  it('renders the game world with all fourteen pieces', () => {
    render(App);
    const world = document.querySelector('svg[role="application"]');
    expect(world?.getAttribute('viewBox')).toBeTruthy();
    expect(document.querySelectorAll('[data-index]')).toHaveLength(14);
  });

  it('shows the footer attribution with a link back to the landing page', () => {
    render(App);
    expect(screen.getByText(/After the puzzle of Archimedes, c\. 250 BC\./)).toBeTruthy();
    const home = screen.getByRole('link', { name: 'Aakkagam Games' });
    expect(home.getAttribute('href')).toBe('https://games.aakkagam.com/');
  });
});
