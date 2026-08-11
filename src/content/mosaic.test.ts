import { describe, expect, it } from 'vitest';
import { getMosaicEntries } from '@/content/mosaic';
import { SECTION_ORDER } from '@/lib/altitude';

/** Anchors may only point at sections that actually exist on the page. */
const SECTION_ANCHORS = new Set(SECTION_ORDER.map((id) => `#${id}`));

describe('mosaic content module', () => {
  it('exposes at least five curated entries', () => {
    expect(getMosaicEntries().length).toBeGreaterThanOrEqual(5);
  });

  it('uses unique ids', () => {
    const ids = getMosaicEntries().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every tile to a destination', () => {
    for (const entry of getMosaicEntries()) {
      expect(entry.href).toBeDefined();
    }
  });

  it('links every route href to a /{domain}/{slug} shape', () => {
    const routeHrefs = getMosaicEntries()
      .map((e) => e.href)
      .filter((href): href is string => href !== undefined && !href.startsWith('#'));
    expect(routeHrefs.length).toBeGreaterThan(0);
    for (const href of routeHrefs) {
      expect(href).toMatch(/^\/[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  });

  it('links every anchor href to a section that exists on the page', () => {
    const anchorHrefs = getMosaicEntries()
      .map((e) => e.href)
      .filter((href): href is string => href !== undefined && href.startsWith('#'));
    expect(anchorHrefs.length).toBeGreaterThan(0);
    for (const href of anchorHrefs) {
      expect(SECTION_ANCHORS.has(href)).toBe(true);
    }
  });

  it('points the first AI entry at the transformer corpus study', () => {
    const ai = getMosaicEntries().find((e) => e.id === 'ai-physics');
    expect(ai?.href).toBe('/ai/transformer-italian-corpus');
  });

  it('points the sky entry at the VDS licence study', () => {
    const sky = getMosaicEntries().find((e) => e.id === 'sky');
    expect(sky?.href).toBe('/sky/vds-licence');
  });

  it('does not expose a mutable live array to callers', () => {
    expect(Object.isFrozen(getMosaicEntries())).toBe(false);
    const first = getMosaicEntries()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
