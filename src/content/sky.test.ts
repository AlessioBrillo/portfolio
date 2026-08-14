import { describe, expect, it } from 'vitest';
import { getSportEntries } from '@/content/sky';

describe('sky content module', () => {
  it('covers the three disciplines: aviation, tennis and MTB', () => {
    const ids = getSportEntries()
      .map((e) => e.id)
      .sort();
    expect(ids).toEqual(['mtb', 'tennis', 'vds']);
  });

  it('uses unique ids and complete metadata', () => {
    const entries = getSportEntries();
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.title).not.toBe('');
      expect(entry.line).not.toBe('');
      expect(entry.image.alt).not.toBe('');
      expect(entry.image.width).toBeTypeOf('number');
      expect(entry.image.height).toBeTypeOf('number');
      expect(entry.image.sizes).not.toBe('');
    }
  });

  it('puts aviation first — the narrative thread', () => {
    expect(getSportEntries()[0]?.id).toBe('vds');
  });

  it('does not expose a mutable live array to callers', () => {
    const first = getSportEntries()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
