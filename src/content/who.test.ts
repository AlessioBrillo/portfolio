import { describe, expect, it } from 'vitest';
import { getWhoPortrait, getWhoStatements } from '@/content/who';

describe('who content module', () => {
  it('shows the three character statements', () => {
    expect(
      getWhoStatements()
        .map((s) => s.id)
        .sort(),
    ).toEqual(['adventurous', 'curious', 'enterprising']);
  });

  it('uses unique ids and complete metadata', () => {
    const statements = getWhoStatements();
    expect(new Set(statements.map((s) => s.id)).size).toBe(statements.length);
    for (const statement of statements) {
      expect(statement.title).not.toBe('');
      expect(statement.line).not.toBe('');
    }
  });

  it('offers a real alt text for the portrait slot', () => {
    expect(getWhoPortrait().alt).not.toBe('');
  });

  it('does not present a synthetic image as a real portrait', () => {
    const portrait = getWhoPortrait();
    expect(portrait.src).toBeUndefined();
    expect(portrait.sources).toBeUndefined();
    expect(portrait.alt).toContain('pending');
  });

  it('does not expose a mutable live array to callers', () => {
    const first = getWhoStatements()[0]!;
    expect(Object.isFrozen(first)).toBe(true);
  });
});
