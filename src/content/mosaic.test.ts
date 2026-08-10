import { describe, expect, it } from 'vitest';
import { getMosaicEntries } from '@/content/mosaic';

describe('mosaic content module', () => {
  it('exposes at least five curated entries', () => {
    expect(getMosaicEntries().length).toBeGreaterThanOrEqual(5);
  });

  it('uses unique ids', () => {
    const ids = getMosaicEntries().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every AI case study to a /{domain}/{slug} route', () => {
    const hrefs = getMosaicEntries()
      .map((e) => e.href)
      .filter((href): href is string => Boolean(href));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  });

  it('points the first AI entry at the transformer corpus study', () => {
    const ai = getMosaicEntries().find((e) => e.id === 'ai-physics');
    expect(ai?.href).toBe('/ai/transformer-italian-corpus');
  });

  it('keeps at least one unlinked tile (index fragments, not only routes)', () => {
    expect(getMosaicEntries().some((e) => !e.href)).toBe(true);
  });

  it('does not expose a mutable live array to callers', () => {
    expect(Object.isFrozen(getMosaicEntries())).toBe(false);
    const first = getMosaicEntries()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
