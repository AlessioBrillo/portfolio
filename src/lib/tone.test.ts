import { describe, expect, it } from 'vitest';
import { TONE } from '@/lib/tone';

describe('tonal constants', () => {
  it('exposes the committed paper and night hex values', () => {
    expect(TONE.paper).toBe('#F4EFE6');
    expect(TONE.night).toBe('#14161D');
  });
});
