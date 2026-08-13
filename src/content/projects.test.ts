import { describe, expect, it } from 'vitest';
import { getProjectEntries } from '@/content/projects';

describe('projects content module', () => {
  it('exposes at least two curated entries', () => {
    expect(getProjectEntries().length).toBeGreaterThanOrEqual(2);
  });

  it('uses unique ids and complete metadata', () => {
    const entries = getProjectEntries();
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.title).not.toBe('');
      expect(entry.line).not.toBe('');
      expect(entry.year).toMatch(/^\d{4}$/);
    }
  });

  it('links deep entries to a /{domain}/{slug} route', () => {
    for (const entry of getProjectEntries()) {
      if (entry.href) {
        expect(entry.href).toMatch(/^\/[a-z0-9-]+\/[a-z0-9-]+$/);
      }
    }
  });

  it('keeps the published case study referenced', () => {
    const corpus = getProjectEntries().find((e) => e.id === 'transformer-italian-corpus');
    expect(corpus?.href).toBe('/ai/transformer-italian-corpus');
    const ascent = getProjectEntries().find((e) => e.id === 'the-ascent');
    expect(ascent?.href).toBe('/work/the-ascent');
  });

  it('does not expose a mutable live array to callers', () => {
    const first = getProjectEntries()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
