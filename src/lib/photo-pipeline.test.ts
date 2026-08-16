import { describe, expect, it } from 'vitest';
import {
  derivativeName,
  effectiveWidths,
  filesToPrune,
  findSlugCollisions,
  HASH_LENGTH,
  slugify,
} from '@/lib/photo-pipeline';

describe('photo pipeline helpers', () => {
  describe('slugify', () => {
    it('lowercases, strips accents and joins with hyphens', () => {
      expect(slugify('VDS volo 01.jpg')).toBe('vds-volo-01');
    });

    it('drops non-alphanumeric characters', () => {
      expect(slugify('MTB—trail!.HEIC')).toBe('mtb-trail');
    });

    it('strips leading and trailing hyphens', () => {
      expect(slugify('--who portrait-.png')).toBe('who-portrait');
    });

    it('keeps digits inside the name', () => {
      expect(slugify('Who Portrait 4x5.png')).toBe('who-portrait-4x5');
    });
  });

  describe('effectiveWidths', () => {
    it('keeps only configured widths that downscale the source', () => {
      expect(effectiveWidths(2000, [480, 960, 1600])).toEqual([480, 960, 1600]);
    });

    it('never upscales: widths wider than the source are dropped', () => {
      expect(effectiveWidths(1200, [480, 960, 1600])).toEqual([480, 960]);
    });

    it('returns an empty set for a source narrower than every width', () => {
      expect(effectiveWidths(300, [480, 960])).toEqual([]);
    });

    it('deduplicates repeated widths', () => {
      expect(effectiveWidths(2000, [480, 480, 960])).toEqual([480, 960]);
    });
  });

  describe('derivativeName', () => {
    it('embeds width and content hash between subject and extension', () => {
      expect(derivativeName('vds', 1600, 'a1b2c3d4', 'avif')).toBe('vds-1600-a1b2c3d4.avif');
    });

    it('keeps the fallback jpeg on the same scheme', () => {
      expect(derivativeName('who-portrait', 1200, '9f8e7d6c', 'jpg')).toBe(
        'who-portrait-1200-9f8e7d6c.jpg',
      );
    });
  });

  describe('findSlugCollisions', () => {
    it('flags raws that slugify to the same subject', () => {
      const collisions = findSlugCollisions(['VDS volo 01.jpg', 'vds-volo-01.png', 'vds.jpg']);
      expect(collisions).toEqual([{ subject: 'vds-volo-01', count: 2 }]);
    });

    it('returns an empty list when every slug is unique', () => {
      expect(findSlugCollisions(['vds-volo-01.jpg', 'who-portrait.png', 'tennis.jpg'])).toEqual([]);
    });
  });

  describe('filesToPrune', () => {
    const produced = new Set(['vds-1600-a1b2c3d4.avif', 'vds-1600-a1b2c3d4.jpg']);

    it('removes hashed derivatives not produced by the current run', () => {
      const existing = ['vds-1600-a1b2c3d4.avif', 'vds-960-0fedcba9.webp', 'vds-960-0fedcba9.jpg'];
      expect(filesToPrune(existing, produced)).toEqual([
        'vds-960-0fedcba9.webp',
        'vds-960-0fedcba9.jpg',
      ]);
    });

    it('removes legacy unhashed derivatives left by the old pipeline', () => {
      const existing = ['vds-1600-a1b2c3d4.avif', 'vds-960.avif', 'vds-480-1a2b3c4d.jpg'];
      expect(filesToPrune(existing, produced)).toEqual(['vds-960.avif', 'vds-480-1a2b3c4d.jpg']);
    });

    it('keeps non-derivative files and the produced set', () => {
      const existing = [
        'vds-1600-a1b2c3d4.avif',
        'README.md',
        'manual-banner.jpg',
        'vds-1600-a1b2c3d4.jpg',
      ];
      expect(filesToPrune(existing, produced)).toEqual([]);
    });

    it('ignores hashes longer than HASH_LENGTH (not pipeline files)', () => {
      const existing = ['vds-1600-a1b2c3d4e5f6.avif', `vds-1600-${'a'.repeat(HASH_LENGTH)}.webp`];
      const expected = [`vds-1600-${'a'.repeat(HASH_LENGTH)}.webp`];
      expect(filesToPrune(existing, produced)).toEqual(expected);
    });
  });
});
