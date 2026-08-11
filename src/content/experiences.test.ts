import { describe, expect, it } from 'vitest';
import { getExperienceEntries } from '@/content/experiences';

describe('experiences content module', () => {
  it('exposes at least three curated stories', () => {
    expect(getExperienceEntries().length).toBeGreaterThanOrEqual(3);
  });

  it('uses unique ids and complete metadata', () => {
    const entries = getExperienceEntries();
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.title).not.toBe('');
      expect(entry.line).not.toBe('');
      if (entry.year) {
        expect(entry.year).toMatch(/^\d{4}$/);
      }
    }
  });

  it('orders the most recent first', () => {
    expect(getExperienceEntries()[0]?.year).toBe('2026');
  });

  it('does not expose a mutable live array to callers', () => {
    const first = getExperienceEntries()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
