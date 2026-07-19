import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ModeTabs from './ModeTabs.svelte';
import { ui } from './state.svelte';

beforeEach(() => {
  ui.mode = 'classic';
});

describe('ModeTabs', () => {
  it('renders a tablist with three labelled tabs', () => {
    render(ModeTabs);
    expect(screen.getByRole('tablist', { name: 'Game mode' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs.map((t) => t.textContent?.trim())).toEqual([
      'Classic',
      'Figures',
      'Collection',
    ]);
  });

  it('marks only the active tab as selected and focusable', () => {
    render(ModeTabs);
    const [classic, figures, collection] = screen.getAllByRole('tab');
    expect(classic.getAttribute('aria-selected')).toBe('true');
    expect(classic.getAttribute('tabindex')).toBe('0');
    expect(figures.getAttribute('aria-selected')).toBe('false');
    expect(figures.getAttribute('tabindex')).toBe('-1');
    expect(collection.getAttribute('aria-selected')).toBe('false');
    expect(collection.getAttribute('tabindex')).toBe('-1');
  });

  it('applies the active class to the selected tab only', () => {
    render(ModeTabs);
    const [classic, figures, collection] = screen.getAllByRole('tab');
    expect(classic.classList.contains('active')).toBe(true);
    expect(figures.classList.contains('active')).toBe(false);
    expect(collection.classList.contains('active')).toBe(false);
  });

  it('clicking a tab sets ui.mode and moves aria-selected', async () => {
    render(ModeTabs);
    const [classic, figures] = screen.getAllByRole('tab');
    await fireEvent.click(figures);
    expect(ui.mode).toBe('figures');
    expect(figures.getAttribute('aria-selected')).toBe('true');
    expect(figures.getAttribute('tabindex')).toBe('0');
    expect(classic.getAttribute('aria-selected')).toBe('false');
    expect(classic.getAttribute('tabindex')).toBe('-1');
  });

  it('ArrowRight moves selection and focus to the next tab', async () => {
    render(ModeTabs);
    const [classic, figures] = screen.getAllByRole('tab');
    await fireEvent.keyDown(classic, { key: 'ArrowRight' });
    expect(ui.mode).toBe('figures');
    expect(figures.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(figures);
  });

  it('ArrowRight wraps from the last tab to the first', async () => {
    ui.mode = 'collection';
    render(ModeTabs);
    const [classic, , collection] = screen.getAllByRole('tab');
    await fireEvent.keyDown(collection, { key: 'ArrowRight' });
    expect(ui.mode).toBe('classic');
    expect(classic.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(classic);
  });

  it('ArrowLeft moves selection backwards and wraps from the first tab', async () => {
    render(ModeTabs);
    const [classic, , collection] = screen.getAllByRole('tab');
    await fireEvent.keyDown(classic, { key: 'ArrowLeft' });
    expect(ui.mode).toBe('collection');
    expect(collection.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(collection);

    await fireEvent.keyDown(collection, { key: 'ArrowLeft' });
    expect(ui.mode).toBe('figures');
  });

  it('ignores unrelated keys', async () => {
    render(ModeTabs);
    const [classic] = screen.getAllByRole('tab');
    await fireEvent.keyDown(classic, { key: 'ArrowDown' });
    expect(ui.mode).toBe('classic');
  });

  it('wires each tab to its panel via aria-controls', () => {
    render(ModeTabs);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.id)).toEqual(['tab-classic', 'tab-figures', 'tab-collection']);
    expect(tabs.map((t) => t.getAttribute('aria-controls'))).toEqual([
      'panel-classic',
      'panel-figures',
      'panel-collection',
    ]);
  });
});
