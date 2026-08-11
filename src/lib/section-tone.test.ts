import { describe, expect, it } from 'vitest';
import { SECTION_ORDER } from '@/lib/altitude';
import { isNightSection, NIGHT_SECTIONS } from '@/lib/section-tone';

describe('NIGHT_SECTIONS', () => {
  it('contains exactly the cruise band and the night landing', () => {
    expect([...NIGHT_SECTIONS]).toEqual(['ai-physics', 'work-school', 'contact']);
  });

  it('is a subset of the live section order', () => {
    for (const id of NIGHT_SECTIONS) {
      expect(SECTION_ORDER).toContain(id);
    }
  });

  it('classifies every section in the page order consistently', () => {
    const expected = {
      hero: false,
      who: false,
      mosaic: false,
      'ai-physics': true,
      'work-school': true,
      'sky-sport': false,
      experiences: false,
      contact: true,
    };
    for (const id of SECTION_ORDER) {
      expect(isNightSection(id)).toBe(expected[id]);
    }
  });
});

describe('isNightSection', () => {
  it('treats an unobserved section as daylight', () => {
    expect(isNightSection(null)).toBe(false);
  });
});
