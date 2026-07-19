import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
const doc = new DOMParser().parseFromString(html, 'text/html');

const meta = (selector: string) =>
  doc.querySelector(`meta[${selector}]`)?.getAttribute('content');

describe('index.html metadata', () => {
  it('has a descriptive title', () => {
    expect(doc.querySelector('title')?.textContent).toBe(
      "Ostomachion — Archimedes' 14-Piece Puzzle, Free in the Browser"
    );
  });

  it('has a meta description mentioning the Ostomachion puzzle', () => {
    expect(meta('name="description"')).toContain('Ostomachion');
  });

  it('has the canonical URL for the games.aakkagam.com subpath', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://games.aakkagam.com/ostomachion/'
    );
  });

  it('has Open Graph tags', () => {
    expect(meta('property="og:title"')).toBeTruthy();
    expect(meta('property="og:description"')).toBeTruthy();
    expect(meta('property="og:url"')).toBe('https://games.aakkagam.com/ostomachion/');
    expect(meta('property="og:image"')).toBe('https://games.aakkagam.com/ostomachion/og.png');
  });

  it('has a twitter card with image', () => {
    expect(meta('name="twitter:card"')).toBe('summary_large_image');
    expect(meta('name="twitter:image"')).toBe('https://games.aakkagam.com/ostomachion/og.png');
  });

  describe('JSON-LD structured data', () => {
    const block = doc.querySelector('script[type="application/ld+json"]');

    it('is present and parses as valid JSON', () => {
      expect(block).not.toBeNull();
      expect(() => JSON.parse(block!.textContent ?? '')).not.toThrow();
    });

    it('describes a free single-player VideoGame', () => {
      const data = JSON.parse(block!.textContent ?? '');
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('VideoGame');
      expect(data.playMode).toBe('SinglePlayer');
      expect(data.isAccessibleForFree).toBe(true);
      expect(data.name).toBe('Ostomachion');
      expect(data.url).toBe('https://games.aakkagam.com/ostomachion/');
    });
  });
});
